// Projects page component
import React from 'react';
import { FolderOpen } from 'lucide-react';

const Projects = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Projects feature coming soon!
        </p>
      </div>
    </div>
  );
};

export default Projects;