import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [files, setFiles] = useState([])
  const [uploads, setUploads] = useState([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentFolder, setCurrentFolder] = useState('root')
  const [folders, setFolders] = useState([
    { id: 'root', name: 'My Files', parentId: null, fileCount: 0 },
    { id: 'documents', name: 'Documents', parentId: 'root', fileCount: 0 },
    { id: 'images', name: 'Images', parentId: 'root', fileCount: 0 },
    { id: 'videos', name: 'Videos', parentId: 'root', fileCount: 0 }
  ])
  const fileInputRef = useRef(null)

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image'
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) return 'video'
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) return 'audio'
    if (['pdf'].includes(extension)) return 'pdf'
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document'
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive'
    return 'file'
  }

  const getFileIcon = (type) => {
    const icons = {
      image: 'Image',
      video: 'Video',
      audio: 'Music',
      pdf: 'FileText',
      document: 'FileText',
      archive: 'Archive',
      file: 'File'
    }
    return icons[type] || 'File'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const simulateUpload = useCallback((file) => {
    const uploadId = Date.now() + Math.random()
    const newUpload = {
      id: uploadId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      startTime: new Date()
    }
    
    setUploads(prev => [...prev, newUpload])

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploads(prev => prev.map(upload => {
        if (upload.id === uploadId) {
          const newProgress = Math.min(upload.progress + Math.random() * 15, 100)
          
          if (newProgress >= 100) {
            clearInterval(interval)
            
            // Add to files list
            const newFile = {
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              type: getFileType(file.name),
              uploadDate: new Date(),
              folderId: currentFolder,
              tags: [],
              url: URL.createObjectURL(file),
              thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
            }
            
            setFiles(prev => [...prev, newFile])
            
            // Remove from uploads
            setTimeout(() => {
              setUploads(prev => prev.filter(u => u.id !== uploadId))
              toast.success(`${file.name} uploaded successfully!`)
            }, 500)
            
            return { ...upload, progress: 100, status: 'completed' }
          }
          
          return { ...upload, progress: newProgress }
        }
        return upload
      }))
    }, 200)

    return uploadId
  }, [currentFolder])

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    selectedFiles.forEach(simulateUpload)
    event.target.value = ''
  }

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach(simulateUpload)
  }, [simulateUpload])

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const deleteSelectedFiles = () => {
    if (selectedFiles.size === 0) return
    
    setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)))
    setSelectedFiles(new Set())
    toast.success(`${selectedFiles.size} file(s) deleted successfully!`)
  }

  const currentFolderFiles = files.filter(file => file.folderId === currentFolder)
  const currentFolderData = folders.find(f => f.id === currentFolder)

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-2">
            File Manager
          </h2>
          <div className="flex items-center space-x-2 text-surface-600 dark:text-surface-400">
            <ApperIcon name="Folder" className="w-4 h-4" />
            <span className="text-sm sm:text-base">{currentFolderData?.name}</span>
            <span className="text-xs">({currentFolderFiles.length} files)</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' 
                ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600' 
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'}`}
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' 
                ? 'bg-white dark:bg-surface-700 shadow-sm text-primary-600' 
                : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'}`}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </button>
          </div>
          
          {selectedFiles.size > 0 && (
            <motion.button
              onClick={deleteSelectedFiles}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
              <span className="hidden sm:inline">Delete ({selectedFiles.size})</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`relative mb-8 p-8 sm:p-12 lg:p-16 border-3 border-dashed rounded-3xl transition-all duration-300 ${
          isDragActive 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500'
        } bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-900 shadow-upload`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          accept="*/*"
        />
        
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow"
            animate={{ 
              rotate: isDragActive ? 360 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ duration: 0.3 }}
          >
            <ApperIcon name={isDragActive ? "Download" : "Upload"} className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          <h3 className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-white mb-2 sm:mb-4">
            {isDragActive ? "Drop files here!" : "Drag & drop files here"}
          </h3>
          
          <p className="text-surface-600 dark:text-surface-300 mb-4 sm:mb-6 text-sm sm:text-base">
            or click to browse your files
          </p>
          
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-upload hover:shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ApperIcon name="Plus" className="w-5 h-5" />
            <span>Choose Files</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 shadow-card border border-surface-200 dark:border-surface-700"
          >
            <h4 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
              Uploading Files
            </h4>
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {upload.fileName}
                      </p>
                      <span className="text-xs text-surface-500 dark:text-surface-400">
                        {Math.round(upload.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2">
                      <div
                        className="upload-progress h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {folders.filter(f => f.parentId === 'root' || f.id === 'root').map((folder) => (
            <motion.button
              key={folder.id}
              onClick={() => setCurrentFolder(folder.id)}
              className={`flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-300 ${
                currentFolder === folder.id
                  ? 'bg-primary-500 text-white shadow-glow'
                  : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ApperIcon name="Folder" className="w-4 h-4" />
              <span className="text-sm sm:text-base font-medium">{folder.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Files Display */}
      {currentFolderFiles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 sm:py-16"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">
            <ApperIcon name="FolderOpen" className="w-12 h-12 sm:w-16 sm:h-16 text-surface-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-white mb-2">
            No files yet
          </h3>
          <p className="text-surface-600 dark:text-surface-300">
            Upload your first file to get started
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6" 
            : "space-y-2 sm:space-y-3"
          }
        >
          {currentFolderFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className={`group relative ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 shadow-card hover:shadow-upload transition-all duration-300 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600'
                  : 'bg-white dark:bg-surface-800 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-card transition-all duration-300 border border-surface-200 dark:border-surface-700'
              } ${selectedFiles.has(file.id) ? 'ring-2 ring-primary-500' : ''}`}
              whileHover={{ y: viewMode === 'grid' ? -5 : 0 }}
            >
              <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-center space-x-4'}`}>
                {/* File Icon/Thumbnail */}
                <div className={`${viewMode === 'grid' ? 'mb-4' : ''} relative`}>
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className={`${viewMode === 'grid' ? 'w-full h-32 sm:h-40' : 'w-12 h-12'} object-cover rounded-lg`}
                    />
                  ) : (
                    <div className={`${viewMode === 'grid' ? 'w-full h-32 sm:h-40' : 'w-12 h-12'} bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 rounded-lg flex items-center justify-center`}>
                      <ApperIcon name={getFileIcon(file.type)} className={`${viewMode === 'grid' ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-6 h-6'} text-surface-500`} />
                    </div>
                  )}
                  
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleFileSelection(file.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-surface-800 rounded-full border-2 border-surface-300 dark:border-surface-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {selectedFiles.has(file.id) && (
                      <ApperIcon name="Check" className="w-3 h-3 text-primary-500" />
                    )}
                  </button>
                </div>

                {/* File Info */}
                <div className={`${viewMode === 'grid' ? '' : 'flex-1 min-w-0'}`}>
                  <h4 className={`font-medium text-surface-900 dark:text-white ${viewMode === 'grid' ? 'mb-2 text-sm sm:text-base' : 'text-sm'} truncate`}>
                    {file.name}
                  </h4>
                  
                  <div className={`text-xs text-surface-500 dark:text-surface-400 ${viewMode === 'grid' ? 'space-y-1' : 'flex items-center space-x-4'}`}>
                    <span>{formatFileSize(file.size)}</span>
                    <span className={viewMode === 'list' ? '' : 'block'}>
                      {format(file.uploadDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {viewMode === 'list' && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                      <ApperIcon name="Download" className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-red-500 transition-colors">
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default MainFeature