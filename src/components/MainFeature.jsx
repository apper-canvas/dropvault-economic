import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from './ApperIcon'

const MainFeature = () => {
  const [files, setFiles] = useState([])
  const [uploads, setUploads] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedFileForHistory, setSelectedFileForHistory] = useState(null)


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
            
            // Add to files list with version history
            const newFile = {
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              type: getFileType(file.name),
              uploadDate: new Date(),
              folderId: currentFolder,
              tags: [],
              url: URL.createObjectURL(file),
              thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
              versions: [
                {
                  id: 1,
                  versionNumber: 1,
                  timestamp: new Date(),
                  size: file.size,
                  url: URL.createObjectURL(file),
                  thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
                  isCurrentVersion: true
                }
              ],
              currentVersion: 1
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
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)))
    const count = selectedFiles.size
    setSelectedFiles(new Set())
    setShowDeleteConfirm(false)
    toast.success(`${count} file(s) deleted successfully!`)
  }

  const moveSelectedFiles = (targetFolderId) => {
    if (selectedFiles.size === 0) return
    
    setFiles(prev => prev.map(file => 
      selectedFiles.has(file.id) 
        ? { ...file, folderId: targetFolderId }
        : file
    ))
    
    const count = selectedFiles.size
    const targetFolder = folders.find(f => f.id === targetFolderId)
    setSelectedFiles(new Set())
    setShowMoveDialog(false)
    toast.success(`${count} file(s) moved to ${targetFolder?.name || 'folder'} successfully!`)
  }

  const copySelectedFiles = (targetFolderId) => {
    if (selectedFiles.size === 0) return
    
    const filesToCopy = files.filter(file => selectedFiles.has(file.id))
    const copiedFiles = filesToCopy.map(file => ({
      ...file,
      id: Date.now() + Math.random(),
      name: `Copy of ${file.name}`,
      folderId: targetFolderId,
      uploadDate: new Date()
    }))
    
    setFiles(prev => [...prev, ...copiedFiles])
    const count = selectedFiles.size
    const targetFolder = folders.find(f => f.id === targetFolderId)
    setSelectedFiles(new Set())
    setShowCopyDialog(false)
    toast.success(`${count} file(s) copied to ${targetFolder?.name || 'folder'} successfully!`)
  }

  const selectAllFiles = () => {
    const allFileIds = new Set(currentFolderFiles.map(file => file.id))
    setSelectedFiles(allFileIds)
  }

  const clearSelection = () => {
    setSelectedFiles(new Set())

  const viewFileHistory = (file) => {
    setSelectedFileForHistory(file)
    setShowVersionHistory(true)
  }

  const revertToVersion = (versionId) => {
    if (!selectedFileForHistory) return
    
    const selectedVersion = selectedFileForHistory.versions.find(v => v.id === versionId)
    if (!selectedVersion) return
    
    // Create new version from selected version
    const newVersionNumber = selectedFileForHistory.currentVersion + 1
    const newVersion = {
      id: Date.now() + Math.random(),
      versionNumber: newVersionNumber,
      timestamp: new Date(),
      size: selectedVersion.size,
      url: selectedVersion.url,
      thumbnail: selectedVersion.thumbnail,
      isCurrentVersion: true
    }
    
    setFiles(prev => prev.map(file => {
      if (file.id === selectedFileForHistory.id) {
        const updatedVersions = file.versions.map(v => ({ ...v, isCurrentVersion: false }))
        return {
          ...file,
          versions: [...updatedVersions, newVersion],
          currentVersion: newVersionNumber,
          url: selectedVersion.url,
          thumbnail: selectedVersion.thumbnail,
          size: selectedVersion.size
        }
      }
      return file
    }))
    
    setShowVersionHistory(false)
    setSelectedFileForHistory(null)
    toast.success(`Reverted to version ${selectedVersion.versionNumber} successfully!`)
  }

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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-surface-600 dark:text-surface-400">
                {selectedFiles.size} selected
              </span>
              <button
                onClick={selectAllFiles}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-surface-600 hover:text-surface-700 transition-colors"
              >
                Clear
              </button>
            </div>
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
                    <button 
                      onClick={() => viewFileHistory(file)}
                      className="p-2 text-surface-400 hover:text-blue-500 transition-colors"
                      title="View History"
                    >
                      <ApperIcon name="History" className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                      <ApperIcon name="Download" className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-surface-400 hover:text-red-500 transition-colors">
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Grid View History Button */}
                {viewMode === 'grid' && (
                  <button 
                    onClick={() => viewFileHistory(file)}
                    className="absolute top-2 left-2 p-2 bg-white dark:bg-surface-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-surface-300 dark:border-surface-600 hover:border-blue-500"
                    title="View History"
                  >
                    <ApperIcon name="History" className="w-4 h-4 text-surface-600 hover:text-blue-500" />
                  </button>
                )}

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Batch Action Toolbar */}
      <AnimatePresence>
        {selectedFiles.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-surface-900 dark:text-white">
                  {selectedFiles.size} file(s) selected
                </span>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setShowMoveDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ApperIcon name="FolderOpen" className="w-4 h-4" />
                    <span>Move</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowCopyDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ApperIcon name="Copy" className="w-4 h-4" />
                    <span>Copy</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={deleteSelectedFiles}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={clearSelection}
                    className="p-2 text-surface-500 hover:text-surface-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
                  <ApperIcon name="AlertTriangle" className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Delete Files
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-surface-700 dark:text-surface-300 mb-6">
                Are you sure you want to delete {selectedFiles.size} selected file(s)?
              </p>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Dialog */}
      <AnimatePresence>
        {showMoveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMoveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
                  <ApperIcon name="FolderOpen" className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Move Files
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Select destination folder
                  </p>
                </div>
              </div>
              
              <p className="text-surface-700 dark:text-surface-300 mb-4">
                Move {selectedFiles.size} selected file(s) to:
              </p>
              
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {folders.filter(f => f.id !== currentFolder).map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => moveSelectedFiles(folder.id)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Folder" className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-900 dark:text-white">{folder.name}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowMoveDialog(false)}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Dialog */}
      <AnimatePresence>
        {showCopyDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCopyDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
                  <ApperIcon name="Copy" className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Copy Files
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Select destination folder
                  </p>
                </div>
              </div>
              
              <p className="text-surface-700 dark:text-surface-300 mb-4">
                Copy {selectedFiles.size} selected file(s) to:
              </p>
              
              <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => copySelectedFiles(folder.id)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700 rounded-lg transition-colors"
                  >
                    <ApperIcon name="Folder" className="w-5 h-5 text-surface-500" />
                    <span className="text-surface-900 dark:text-white">{folder.name}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowCopyDialog(false)}
                className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

      {/* Version History Dialog */}
      <AnimatePresence>
        {showVersionHistory && selectedFileForHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVersionHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
                  <ApperIcon name="History" className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                    Version History
                  </h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400 truncate">
                    {selectedFileForHistory.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowVersionHistory(false)}
                  className="p-2 text-surface-500 hover:text-surface-700 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedFileForHistory.versions
                  .sort((a, b) => b.versionNumber - a.versionNumber)
                  .map((version) => (
                  <div
                    key={version.id}
                    className={`p-4 rounded-xl border transition-all ${
                      version.isCurrentVersion
                        ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {version.thumbnail ? (
                            <img
                              src={version.thumbnail}
                              alt={`Version ${version.versionNumber}`}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-surface-100 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                              <ApperIcon name={getFileIcon(selectedFileForHistory.type)} className="w-6 h-6 text-surface-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-surface-900 dark:text-white">
                              Version {version.versionNumber}
                            </h4>
                            {version.isCurrentVersion && (
                              <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                            <div>{format(version.timestamp, 'MMM dd, yyyy \u2022 HH:mm')}</div>
                            <div>{formatFileSize(version.size)}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!version.isCurrentVersion && (
                          <motion.button
                            onClick={() => revertToVersion(version.id)}
                            className="px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Revert
                          </motion.button>
                        )}
                        <button className="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                          <ApperIcon name="Download" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {version.isCurrentVersion && (
                      <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
                        <p className="text-xs text-primary-700 dark:text-primary-300">
                          This is the current version of the file
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="flex items-center justify-between text-sm text-surface-600 dark:text-surface-400">
                  <span>Total versions: {selectedFileForHistory.versions.length}</span>
                  <span>Current: v{selectedFileForHistory.currentVersion}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </AnimatePresence>

    </div>
  )
}

export default MainFeature