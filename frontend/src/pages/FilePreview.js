import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Play, Pause } from 'lucide-react';

export default function FilePreview() {
  const { fileId } = useParams();
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchFile();
  }, [fileId]);

  const fetchFile = async () => {
    try {
      const response = await axios.get(`${API}/files/${fileId}/preview`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setPreviewUrl(url);
      
      // Get file metadata
      const fileMetadata = await axios.get(`${API}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFile({ filename: 'Preview File' });
    } catch (error) {
      toast.error('Failed to load file preview');
    } finally {
      setLoading(false);
    }
  };

  const isVideo = (filename) => {
    return filename && /\.(mp4|mov|avi|wmv|flv|webm)$/i.test(filename);
  };

  const isAudio = (filename) => {
    return filename && /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="text-white/70 hover:text-white"
            data-testid="preview-back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-white/70 hover:text-white"
          >
            Logout
          </Button>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">File Preview</h1>
          
          <div className="bg-black rounded-lg p-4 mb-4">
            {previewUrl && (
              <div className="flex items-center justify-center min-h-[400px]">
                {isVideo(file?.filename) ? (
                  <video
                    controls
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    className="max-w-full max-h-[600px] rounded"
                    data-testid="video-preview"
                  >
                    <source src={previewUrl} />
                    Your browser does not support video playback.
                  </video>
                ) : isAudio(file?.filename) ? (
                  <div className="w-full">
                    <audio
                      controls
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full"
                      data-testid="audio-preview"
                    >
                      <source src={previewUrl} />
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                ) : (
                  <div className="text-[#a1a1aa] text-center">
                    <p>Preview not available for this file type.</p>
                    <p className="text-sm mt-2">Audio and video files only.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg p-4">
            <p className="text-[#ef4444] text-sm font-medium">
              ⚠️ Note: Downloads are disabled. This is a preview-only view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
