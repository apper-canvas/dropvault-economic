import { useState } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const features = [
    {
      icon: 'Upload',
      title: 'Drag & Drop Upload',
      description: 'Simply drag files into the upload zone for instant processing'
    },
    {
      icon: 'Eye',
      title: 'File Preview',
      description: 'Preview documents, images, and media files before organizing'
    },
    {
      icon: 'FolderTree',
      title: 'Smart Organization',
      description: 'Organize files with folders, tags, and metadata management'
    },
    {
      icon: 'Shield',
      title: 'Secure Storage',
      description: 'Enterprise-grade security with encrypted file storage'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-50 border-b border-surface-200/50 backdrop-blur-lg bg-white/80 dark:bg-surface-900/80 dark:border-surface-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-glow flex items-center justify-center">
                  <ApperIcon name="Cloud" className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  DropVault
                </h1>
                <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 hidden sm:block">
                  File Management Platform
                </p>
              </div>
            </motion.div>

            <motion.button
              onClick={toggleDarkMode}
              className="p-2 sm:p-3 rounded-xl bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 transition-all duration-300 shadow-neu-light dark:shadow-neu-dark"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ApperIcon 
                name={darkMode ? "Sun" : "Moon"} 
                className="w-5 h-5 sm:w-6 sm:h-6 text-surface-700 dark:text-surface-300" 
              />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-transparent to-secondary-100/50 dark:from-primary-900/20 dark:to-secondary-900/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h2 
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-white mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Your Files,{' '}
              <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent bg-clip-text text-transparent">
                Organized & Secure
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl text-surface-600 dark:text-surface-300 mb-8 sm:mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Upload, organize, and manage your files with our intuitive platform. 
              Drag-and-drop simplicity meets enterprise-grade security.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center space-x-2 text-surface-600 dark:text-surface-400">
                <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-500" />
                <span className="text-sm sm:text-base">Secure Cloud Storage</span>
              </div>
              <div className="flex items-center space-x-2 text-surface-600 dark:text-surface-400">
                <ApperIcon name="Zap" className="w-5 h-5 text-accent" />
                <span className="text-sm sm:text-base">Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2 text-surface-600 dark:text-surface-400">
                <ApperIcon name="Users" className="w-5 h-5 text-primary-500" />
                <span className="text-sm sm:text-base">Team Collaboration</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Feature */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <MainFeature />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-20 bg-surface-50/50 dark:bg-surface-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              Powerful Features
            </h3>
            <p className="text-lg text-surface-600 dark:text-surface-300 max-w-2xl mx-auto">
              Everything you need to manage your files efficiently and securely
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group relative p-6 sm:p-8 bg-white dark:bg-surface-800 rounded-2xl sm:rounded-3xl shadow-card hover:shadow-upload transition-all duration-500 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    <ApperIcon name={feature.icon} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h4 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h4>
                  
                  <p className="text-sm sm:text-base text-surface-600 dark:text-surface-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-900/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <ApperIcon name="Cloud" className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-surface-900 dark:text-white">
                DropVault
              </span>
            </div>
            
            <p className="text-sm text-surface-600 dark:text-surface-400 text-center sm:text-right">
              © 2024 DropVault. Secure file management for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home