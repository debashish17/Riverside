const { prisma } = require('../services/database');

exports.createSession = async (req, res) => {
  try {
    const { name, description, maxParticipants } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Session name is required and cannot be empty' 
      });
    }
    
    if (name.length > 100) {
      return res.status(400).json({ 
        error: 'Session name must be less than 100 characters' 
      });
    }
    
    console.log(`🎥 Creating session "${name}" for user: ${req.user.username}`);
    
    // Create session in database
    const session = await prisma.session.create({
      data: {
        name: name.trim(),
        description: description || null,
        ownerId: req.user.id,
        maxParticipants: maxParticipants || 10,
        status: 'active', // Explicitly set status to active
        members: {
          create: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    console.log(`✅ Session created with ID: ${session.id}`);
    
    // Return session data with consistent format
    const sessionResponse = {
      ...session,
      owner: session.owner.username,
      members: session.members.map(m => m.user.username),
      participants: session.members.map(m => ({
        id: m.user.id,
        username: m.user.username,
        isOwner: Number(m.user.id) === Number(session.ownerId)
      }))
    };
    
    res.status(201).json({
      success: true,
      id: session.id,
      name: session.name,
      ...sessionResponse,
      message: 'Session created successfully'
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create session',
      message: error.message 
    });
  }
};

exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ 
        error: 'Session is not active' 
      });
    }
    
    if (session.members.length >= session.maxParticipants) {
      return res.status(400).json({ 
        error: 'Session is full' 
      });
    }
    
    // Check if user is already a member
    const isMember = session.members.some(m => m.userId === req.user.id);
    
    if (!isMember) {
      await prisma.sessionMember.create({
        data: {
          sessionId: session.id,
          userId: req.user.id
        }
      });
      console.log(`👤 User ${req.user.username} joined session ${sessionId}`);
    }
    
    // Get updated session
    const updatedSession = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    // Broadcast participant update to all users in the session
    const participantsUpdate = updatedSession.members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      isOwner: m.user.id === updatedSession.ownerId
    }));

    // Emit to all users in the session room
    if (req.io) {
      const room = String(sessionId);
      const socketsInRoom = req.io.sockets.adapter.rooms.get(room);
      console.log(`📡 Broadcasting user joined to room ${room} - ${socketsInRoom?.size || 0} sockets in room`);

      req.io.to(room).emit('participants-update', participantsUpdate);
      console.log(`📡 Broadcasted participant update to session ${room} (${participantsUpdate.length} participants)`);
    }

    res.json({
      success: true,
      session: {
        ...updatedSession,
        owner: updatedSession.owner.username,
        members: updatedSession.members.map(m => m.user.username),
        participants: participantsUpdate
      },
      message: 'Joined session successfully'
    });
  } catch (error) {
    console.error('Session join error:', error);
    res.status(500).json({ 
      error: 'Failed to join session',
      message: error.message 
    });
  }
};

exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    // Check if user has access to this session (owner or member)
    const isMember = session.members.some(m => Number(m.userId) === Number(req.user.id));
    const isOwner = Number(session.ownerId) === Number(req.user.id);

    console.log(`🔍 Get session ${sessionId} - User: ${req.user.id} (${req.user.username}), Is Owner: ${isOwner}, Is Member: ${isMember}`);
    
    if (!isMember && !isOwner) {
      return res.status(403).json({ 
        error: 'Access denied to this session' 
      });
    }
    
    // Add participants info for frontend
    const participants = session.members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      isOwner: Number(m.user.id) === Number(session.ownerId)
    }));

    console.log(`📋 Session ${sessionId} participants:`, participants.map(p => `${p.username}${p.isOwner ? ' (owner)' : ''}`).join(', '));
    
    res.json({
      success: true,
      ...session,
      owner: session.owner.username,
      members: session.members.map(m => m.user.username),
      participants
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      error: 'Failed to get session',
      message: error.message 
    });
  }
};

exports.listUserSessions = async (req, res) => {
  try {
    console.log(`📋 Fetching sessions for user: ${req.user.username} (ID: ${req.user.id})`);
    
    const userSessions = await prisma.session.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Separate sessions by status for better frontend handling
    const activeSessions = userSessions.filter(s => s.status === 'active');
    const endedSessions = userSessions.filter(s => s.status === 'ended');
    const terminatedSessions = userSessions.filter(s => s.status === 'terminated');

    const formattedSessions = userSessions.map(session => ({
      ...session,
      owner: session.owner.username,
      members: session.members.map(m => m.user.username),
      isOwner: session.ownerId === req.user.id
    }));

    console.log(`📊 Found ${formattedSessions.length} sessions for user ${req.user.username}`);
    console.log(`   • Active: ${activeSessions.length}`);
    console.log(`   • Ended: ${endedSessions.length}`);
    console.log(`   • Terminated: ${terminatedSessions.length}`);

    res.json({
      success: true,
      sessions: formattedSessions,
      summary: {
        total: formattedSessions.length,
        active: activeSessions.length,
        ended: endedSessions.length,
        terminated: terminatedSessions.length
      }
    });
  } catch (error) {
    console.error('Session list error:', error);
    res.status(500).json({ 
      error: 'Failed to list sessions',
      message: error.message 
    });
  }
};

// Get only active sessions for dashboard
exports.getActiveSessions = async (req, res) => {
  try {
    console.log(`🟢 Fetching active sessions for user: ${req.user.username}`);

    // Update any sessions that don't have a status set (legacy data)
    const allUserSessions = await prisma.session.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        status: true,
        ownerId: true
      }
    });

    if (allUserSessions.some(s => !s.status)) {
      console.log(`🔧 Updating sessions without status to 'active'`);
      await prisma.session.updateMany({
        where: {
          status: null,
          members: {
            some: {
              userId: req.user.id
            }
          }
        },
        data: {
          status: 'active'
        }
      });
    }
    
    const activeSessions = await prisma.session.findMany({
      where: {
        status: 'active',
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedSessions = activeSessions.map(session => ({
      ...session,
      owner: session.owner.username,
      members: session.members.map(m => m.user.username),
      isOwner: session.ownerId === req.user.id
    }));

    console.log(`🟢 Found ${formattedSessions.length} active sessions for user ${req.user.username}`);

    res.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length
    });
  } catch (error) {
    console.error('Active sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get active sessions',
      message: error.message 
    });
  }
};

// Get recent (ended/terminated) sessions for session history
exports.getRecentSessions = async (req, res) => {
  try {
    console.log(`📜 Fetching recent sessions for user: ${req.user.username}`);
    
    const recentSessions = await prisma.session.findMany({
      where: {
        status: {
          in: ['ended', 'terminated']
        },
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        endedAt: 'desc'
      },
      take: 20 // Limit to last 20 recent sessions
    });

    const formattedSessions = recentSessions.map(session => ({
      ...session,
      owner: session.owner.username,
      members: session.members.map(m => m.user.username),
      isOwner: session.ownerId === req.user.id
    }));

    console.log(`📜 Found ${formattedSessions.length} recent sessions for user ${req.user.username}`);

    res.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length
    });
  } catch (error) {
    console.error('Recent sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get recent sessions',
      message: error.message 
    });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: true
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    const isOwner = Number(session.ownerId) === Number(req.user.id);
    if (!isOwner) {
      console.log(`❌ User ${req.user.username} (ID: ${req.user.id}) attempted to end session owned by ${session.owner.username} (ID: ${session.ownerId})`);
      return res.status(403).json({
        error: 'Only session owner can end the session'
      });
    }
    
    const updatedSession = await prisma.session.update({
      where: { id: Number(sessionId) },
      data: {
        status: 'ended',
        endedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    console.log(`🔚 Session ${sessionId} ended by ${req.user.username}`);
    
    res.json({
      success: true,
      session: {
        ...updatedSession,
        owner: updatedSession.owner.username,
        members: updatedSession.members.map(m => m.user.username)
      },
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ 
      error: 'Failed to end session',
      message: error.message 
    });
  }
};

exports.clearSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: true
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    const isOwner = Number(session.ownerId) === Number(req.user.id);
    if (!isOwner) {
      console.log(`❌ User ${req.user.username} (ID: ${req.user.id}) attempted to clear session owned by ${session.owner.username} (ID: ${session.ownerId})`);
      return res.status(403).json({
        error: 'Only session owner can clear the session'
      });
    }
    
    // Delete session (cascade will delete members and recordings)
    await prisma.session.delete({
      where: { id: Number(sessionId) }
    });
    
    console.log(`🗑️ Session ${sessionId} cleared by ${req.user.username}`);
    
    res.json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error) {
    console.error('Session clear error:', error);
    res.status(500).json({ 
      error: 'Failed to clear session',
      message: error.message 
    });
  }
};

// Smart leave session - handles both owner and member cases
exports.smartLeaveSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    // Check if user is the owner
    const isOwner = Number(session.ownerId) === Number(req.user.id);
    console.log(`🔍 Leave check - User: ${req.user.id} (${req.user.username}), Session Owner: ${session.ownerId} (${session.owner.username}), Is Owner: ${isOwner}`);

    if (isOwner) {
      // Owner leaving: Terminate session and remove all members
      console.log(`👑 Owner ${req.user.username} leaving session ${sessionId} - terminating for all members`);
      
      // Mark session as terminated
      const updatedSession = await prisma.session.update({
        where: { id: Number(sessionId) },
        data: {
          status: 'terminated',
          endedAt: new Date()
        }
      });
      
      // Remove all session members (effectively kicking everyone out)
      await prisma.sessionMember.deleteMany({
        where: {
          sessionId: Number(sessionId)
        }
      });
      
      console.log(`🔴 Session ${sessionId} terminated by owner ${req.user.username} - all members removed`);

      // Broadcast session termination to all users in the room
      if (req.io) {
        const room = String(sessionId);
        const socketsInRoom = req.io.sockets.adapter.rooms.get(room);
        console.log(`📡 Attempting to broadcast to room ${room} - ${socketsInRoom?.size || 0} sockets in room`);

        req.io.to(room).emit('session-terminated', {
          sessionId: room,
          message: 'Session has been ended by the owner'
        });
        req.io.to(room).emit('participants-update', []);
        console.log(`📡 Broadcasted session termination to session ${room}`);
      }

      return res.json({
        success: true,
        session: updatedSession,
        message: 'Session terminated successfully - all members have been removed',
        action: 'terminated'
      });
    } else {
      // Non-owner leaving: Just remove from session
      console.log(`👤 Member ${req.user.username} leaving session ${sessionId}`);
      
      // Check if user is actually a member
      const memberRecord = session.members.find(m => m.userId === req.user.id);
      if (!memberRecord) {
        return res.status(404).json({ 
          error: 'You are not a member of this session' 
        });
      }
      
      // Remove user from session members
      await prisma.sessionMember.delete({
        where: {
          id: memberRecord.id
        }
      });
      
      console.log(`👋 User ${req.user.username} left session ${sessionId}`);

      // Get updated session info
      const updatedSession = await prisma.session.findUnique({
        where: { id: Number(sessionId) },
        include: {
          owner: {
            select: {
              id: true,
              username: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        }
      });

      // Broadcast updated participant list to remaining users
      const participantsUpdate = updatedSession.members.map(m => ({
        id: m.user.id,
        username: m.user.username,
        isOwner: m.user.id === updatedSession.ownerId
      }));

      if (req.io) {
        const room = String(sessionId);
        const socketsInRoom = req.io.sockets.adapter.rooms.get(room);
        console.log(`📡 Broadcasting member left to room ${room} - ${socketsInRoom?.size || 0} sockets in room`);

        req.io.to(room).emit('participants-update', participantsUpdate);
        req.io.to(room).emit('user-left', { userId: req.user.id, username: req.user.username });
        console.log(`📡 Broadcasted participant update to session ${room} (${participantsUpdate.length} remaining)`);
      }

      return res.json({
        success: true,
        session: {
          ...updatedSession,
          owner: updatedSession.owner.username,
          members: updatedSession.members.map(m => m.user.username),
          participants: participantsUpdate
        },
        message: 'Left session successfully',
        action: 'left'
      });
    }
  } catch (error) {
    console.error('Smart leave session error:', error);
    res.status(500).json({ 
      error: 'Failed to leave session',
      message: error.message 
    });
  }
};

// Leave session - for non-owners to leave the session
exports.leaveSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Check if user is actually a member
    const memberRecord = session.members.find(m => m.userId === req.user.id);
    if (!memberRecord) {
      return res.status(404).json({
        error: 'You are not a member of this session'
      });
    }

    // Check if user is the owner
    const isOwner = Number(session.ownerId) === Number(req.user.id);

    // Remove user from session members
    await prisma.sessionMember.delete({
      where: {
        id: memberRecord.id
      }
    });

    if (isOwner) {
      console.log(`👑 Owner ${req.user.username} left session ${sessionId} - session continues without owner`);
    } else {
      console.log(`👋 User ${req.user.username} left session ${sessionId}`);
    }
    
    // Get updated session info
    const updatedSession = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    // Broadcast updated participant list to remaining users
    const participantsUpdate = updatedSession.members.map(m => ({
      id: m.user.id,
      username: m.user.username,
      isOwner: Number(m.user.id) === Number(updatedSession.ownerId)
    }));

    if (req.io) {
      const room = String(sessionId);
      const socketsInRoom = req.io.sockets.adapter.rooms.get(room);
      console.log(`📡 Broadcasting member left to room ${room} - ${socketsInRoom?.size || 0} sockets in room`);

      req.io.to(room).emit('participants-update', participantsUpdate);
      req.io.to(room).emit('user-left', {
        userId: req.user.id,
        username: req.user.username,
        wasOwner: isOwner
      });
      console.log(`📡 Broadcasted participant update to session ${room} (${participantsUpdate.length} remaining)`);
    }

    res.json({
      success: true,
      session: {
        ...updatedSession,
        owner: updatedSession.owner.username,
        members: updatedSession.members.map(m => m.user.username),
        participants: participantsUpdate
      },
      message: 'Left session successfully'
    });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({ 
      error: 'Failed to leave session',
      message: error.message 
    });
  }
};

// Terminate session - enhanced logic for when owner leaves
exports.terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'Session ID is required' 
      });
    }
    
    const session = await prisma.session.findUnique({
      where: { id: Number(sessionId) },
      include: {
        owner: true,
        members: {
          include: {
            user: true
          }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found' 
      });
    }
    
    // Only session owner can terminate
    const isOwner = Number(session.ownerId) === Number(req.user.id);
    if (!isOwner) {
      console.log(`❌ User ${req.user.username} (ID: ${req.user.id}) attempted to terminate session owned by ${session.owner.username} (ID: ${session.ownerId})`);
      return res.status(403).json({
        error: 'Only session owner can terminate the session'
      });
    }
    
    // Mark session as ended and remove all members
    const updatedSession = await prisma.session.update({
      where: { id: Number(sessionId) },
      data: {
        status: 'terminated',
        endedAt: new Date()
      }
    });
    
    // Remove all session members (effectively kicking everyone out)
    await prisma.sessionMember.deleteMany({
      where: {
        sessionId: Number(sessionId)
      }
    });

    console.log(`🔴 Session ${sessionId} terminated by owner ${req.user.username} - all members removed`);

    // Broadcast session termination to all users in the room
    if (req.io) {
      const room = String(sessionId);
      const socketsInRoom = req.io.sockets.adapter.rooms.get(room);
      console.log(`📡 Attempting to broadcast termination to room ${room} - ${socketsInRoom?.size || 0} sockets in room`);

      req.io.to(room).emit('session-terminated', {
        sessionId: room,
        message: 'Session has been ended by the owner'
      });
      req.io.to(room).emit('participants-update', []);
      console.log(`📡 Broadcasted session termination to session ${room}`);
    }

    res.json({
      success: true,
      session: updatedSession,
      message: 'Session terminated successfully - all members have been removed'
    });
  } catch (error) {
    console.error('Session termination error:', error);
    res.status(500).json({ 
      error: 'Failed to terminate session',
      message: error.message 
    });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const allSessions = await prisma.session.findMany({
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const formattedSessions = allSessions.map(session => ({
      id: session.id,
      name: session.name,
      owner: session.owner.username,
      memberCount: session.members.length,
      status: session.status,
      createdAt: session.createdAt
    }));
    
    res.json({
      success: true,
      totalSessions: formattedSessions.length,
      sessions: formattedSessions
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions',
      message: error.message 
    });
  }
};
