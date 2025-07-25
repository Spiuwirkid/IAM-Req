import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Camera, Save, X } from 'lucide-react';
import { useCustomAlert, showSuccessAlert, showErrorAlert } from './custom-alert';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    avatar?: string;
  };
  onSave: (updatedUser: { name: string; avatar?: string }) => Promise<void>;
}

export const ProfileModal = ({ isOpen, onClose, user, onSave }: ProfileModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    avatar: user.avatar || null
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(user.avatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert(showErrorAlert(
          'Invalid File Type',
          'Please select a valid image file (JPG, PNG, GIF, etc.)'
        ));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert(showErrorAlert(
          'File Too Large',
          'Please select an image smaller than 5MB'
        ));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewAvatar(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewAvatar(null);
    setFormData(prev => ({ ...prev, avatar: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validate name
      if (!formData.name.trim()) {
        showAlert(showErrorAlert(
          'Invalid Name',
          'Name cannot be empty'
        ));
        return;
      }

      await onSave({
        name: formData.name.trim(),
        avatar: formData.avatar || undefined
      });

      showAlert(showSuccessAlert(
        'Profile Updated',
        'Your profile has been successfully updated'
      ));

      onClose();
    } catch (error) {
      showAlert(showErrorAlert(
        'Update Failed',
        `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'staff': return 'bg-blue-500';
      case 'manager': return 'bg-green-500';
      case 'itadmin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Profile Settings</span>
            </DialogTitle>
            <DialogDescription>
              Update your profile information and picture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={previewAvatar || undefined} />
                  <AvatarFallback className={`text-white text-lg font-semibold ${getRoleColor(user.role)}`}>
                    {getUserInitials(formData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </Button>
                {previewAvatar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            {/* Read-only Information */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-sm text-gray-600">Email Address</Label>
                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{user.email}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Role</Label>
                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded capitalize">{user.role}</div>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Department</Label>
                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{user.department}</div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {AlertComponent}
    </>
  );
}; 