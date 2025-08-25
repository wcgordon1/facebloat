import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { 
  Share2, 
  Copy,
  Check,
  X
} from "lucide-react";
import { 
  FaLinkedin, 
  FaFacebook, 
  FaTwitter, 
  FaPinterest, 
  FaReddit 
} from "react-icons/fa";
import { cn } from "@/utils/misc";

export interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  hashtags?: string[];
  onClose?: () => void;
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ReactNode;
  shareUrl: (props: SocialShareProps) => string;
  color: string;
  bgColor: string;
}

const platforms: SharePlatform[] = [
  {
    name: "LinkedIn",
    icon: <FaLinkedin className="h-5 w-5" />,
    shareUrl: ({ url }) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}`,
    color: "text-[#0A66C2]",
    bgColor: "bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-[#0A66C2]/20"
  },
  {
    name: "Facebook",
    icon: <FaFacebook className="h-5 w-5" />,
    shareUrl: ({ url }) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`,
    color: "text-[#1877F2]",
    bgColor: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/20"
  },
  {
    name: "Twitter",
    icon: <FaTwitter className="h-5 w-5" />,
    shareUrl: ({ url, title, hashtags }) => {
      const text = title || "Check out my Face Bloat Risk Assessment results!";
      const hashtagString = hashtags?.length ? `&hashtags=${hashtags.join(',')}` : "";
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url || window.location.href)}&text=${encodeURIComponent(text)}${hashtagString}`;
    },
    color: "text-[#1DA1F2]",
    bgColor: "bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-[#1DA1F2]/20"
  },
  {
    name: "Pinterest",
    icon: <FaPinterest className="h-5 w-5" />,
    shareUrl: ({ url, title, imageUrl }) => {
      const description = title || "Face Bloat Risk Assessment Results";
      const media = imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : "";
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url || window.location.href)}${media}&description=${encodeURIComponent(description)}`;
    },
    color: "text-[#E60023]",
    bgColor: "bg-[#E60023]/10 hover:bg-[#E60023]/20 border-[#E60023]/20"
  },
  {
    name: "Reddit",
    icon: <FaReddit className="h-5 w-5" />,
    shareUrl: ({ url, title }) => {
      const shareTitle = title || "My Face Bloat Risk Assessment Results";
      return `https://www.reddit.com/submit?url=${encodeURIComponent(url || window.location.href)}&title=${encodeURIComponent(shareTitle)}`;
    },
    color: "text-[#FF4500]",
    bgColor: "bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border-[#FF4500]/20"
  }
];

export function SocialShare({ 
  url,
  title = "Check out my Face Bloat Risk Assessment results!",
  description = "I just completed a comprehensive face bloat analysis and got personalized insights.",
  imageUrl,
  hashtags = ["FaceBloat", "Health", "Wellness"],
  onClose,
  className
}: SocialShareProps) {
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // Check if Web Share API is supported (typically mobile)
    setIsNativeShareSupported('navigator' in window && 'share' in navigator);
  }, []);

  const handleNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title,
        text: description,
        url: currentUrl,
      });
      setShareError(null);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setShareError('Failed to share. Please try another method.');
      }
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    const shareUrl = platform.shareUrl({ url: currentUrl, title, description, imageUrl, hashtags });
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShareError(null);
    } catch (error) {
      setShareError('Failed to copy link');
    }
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5" />
            Share Your Results
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {shareError && (
          <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {shareError}
          </div>
        )}

        {/* Native Share (Mobile) */}
        {isNativeShareSupported && (
          <Button
            onClick={handleNativeShare}
            className="w-full gap-2"
            variant="default"
          >
            <Share2 className="h-4 w-4" />
            Share via Device
          </Button>
        )}

        {/* Social Platforms */}
        <div className="grid grid-cols-2 gap-3">
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              onClick={() => handlePlatformShare(platform)}
              variant="outline"
              className={cn(
                "h-12 gap-2 justify-start transition-all duration-200 border",
                platform.bgColor,
                platform.color,
                "hover:scale-[1.02] hover:shadow-sm"
              )}
            >
              {platform.icon}
              <span className="font-medium">{platform.name}</span>
            </Button>
          ))}
        </div>

        {/* Copy Link */}
        <div className="pt-2 border-t border-border">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Preview URL */}
        <div className="text-xs text-muted-foreground break-all bg-muted/50 p-2 rounded border">
          {currentUrl}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for sharing functionality
export function useSocialShare() {
  const [isOpen, setIsOpen] = useState(false);

  const openShare = () => setIsOpen(true);
  const closeShare = () => setIsOpen(false);

  return {
    isOpen,
    openShare,
    closeShare,
  };
}
