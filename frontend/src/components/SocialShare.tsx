'use client'

import { Share2, MessageCircle, Facebook, Twitter, Link2, Mail } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface SocialShareProps {
  title: string
  description?: string
  url: string
  imageUrl?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function SocialShare({ 
  title, 
  description = '', 
  url, 
  imageUrl = '', 
  className = '',
  size = 'md'
}: SocialShareProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const shareText = `Check out this amazing recipe: ${title}${description ? ` - ${description.slice(0, 100)}...` : ''}`
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(shareText)
  const encodedUrl = encodeURIComponent(url)
  const encodedImage = encodeURIComponent(imageUrl)

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  }

  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top
      
      // If there's not enough space below (less than 400px) and more space above, show dropdown above
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [showDropdown])

  const handleNativeShare = async () => {
    // Only use native sharing on mobile devices, not desktop/Mac
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        })
      } catch (error) {
        // If native sharing fails, show dropdown
        setShowDropdown(true)
      }
    } else {
      setShowDropdown(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleShareClick = (platform: string) => {
    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400')
    setShowDropdown(false)
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleNativeShare}
        className={`flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-colors ${buttonSizeClasses[size]}`}
        title="Share recipe"
      >
        <Share2 className={sizeClasses[size]} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div 
            ref={dropdownRef}
            className={`absolute right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-48 max-h-96 overflow-y-auto ${
              dropdownPosition === 'top' 
                ? 'bottom-full mb-2' 
                : 'top-full mt-2'
            }`}
          >
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Share Recipe</h3>
              
              <div className="space-y-2">
                {/* WhatsApp */}
                <button
                  onClick={() => handleShareClick('whatsapp')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShareClick('facebook')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Facebook className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Facebook</span>
                </button>

                {/* Twitter */}
                <button
                  onClick={() => handleShareClick('twitter')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <Twitter className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Twitter</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShareClick('linkedin')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">in</span>
                  </div>
                  <span className="text-sm text-gray-700">LinkedIn</span>
                </button>

                {/* Pinterest */}
                <button
                  onClick={() => handleShareClick('pinterest')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <span className="text-sm text-gray-700">Pinterest</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => handleShareClick('telegram')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm text-gray-700">Telegram</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => handleShareClick('email')}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">Email</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <Link2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 