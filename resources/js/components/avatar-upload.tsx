import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInitials } from '@/hooks/use-initials';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImageCrop, ImageCropApply, ImageCropContent } from '../../../components/ui/kibo-ui/image-crop';

interface AvatarUploadProps {
    user: {
        avatar: string;
        name: string;
    };
}

// Helper to convert data URL to File object
const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export function AvatarUpload({ user }: AvatarUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const getInitials = useInitials();
    const {
        setData,
        post,
        processing,
        delete: destroy,
    } = useForm<{
        avatar: File | null;
    }>({
        avatar: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setOpen(true);
        }
    };

    const handleCrop = (croppedImage: string) => {
        const file = dataURLtoFile(croppedImage, 'avatar.png');
        setData('avatar', file);
        post('/settings/avatar', {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                setSelectedFile(null);
                toast.success('Avatar updated', {
                    description: 'Your avatar has been updated successfully.',
                });
            },
        });
    };

    const handleDelete = () => {
        destroy('/settings/avatar', {
            onSuccess: () => {
                toast.success('Avatar deleted', {
                    description: 'Your avatar has been deleted successfully.',
                });
            },
        });
    };

    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-2">
                <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                Change Avatar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crop your new avatar</DialogTitle>
                            </DialogHeader>
                            {selectedFile && (
                                <ImageCrop file={selectedFile} onCrop={handleCrop} aspect={1} circularCrop>
                                    <ImageCropContent />
                                    <div className="mt-4 flex justify-end">
                                        <ImageCropApply asChild>
                                            <Button disabled={processing}>{processing ? 'Uploading...' : 'Apply'}</Button>
                                        </ImageCropApply>
                                    </div>
                                </ImageCrop>
                            )}
                        </DialogContent>
                    </Dialog>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={processing}>
                        Delete Avatar
                    </Button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
            </div>
        </div>
    );
}
