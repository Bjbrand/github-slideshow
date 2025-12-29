import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Disc3, Download, MessageSquare, Upload, FileText, ArrowLeft } from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [revisionMessage, setRevisionMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submittingRevision, setSubmittingRevision] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, filesRes, revisionsRes] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/projects/${projectId}/files`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/projects/${projectId}/revisions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProject(projectRes.data);
      setFiles(filesRes.data);
      setRevisions(revisionsRes.data);
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/projects/${projectId}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('File uploaded successfully!');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRevisionSubmit = async (e) => {
    e.preventDefault();
    if (!revisionMessage.trim()) return;

    setSubmittingRevision(true);
    try {
      await axios.post(`${API}/revisions`, {
        project_id: projectId,
        message: revisionMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Revision request submitted!');
      setRevisionMessage('');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to submit revision');
    } finally {
      setSubmittingRevision(false);
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await axios.get(`${API}/files/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-[#a1a1aa] bg-white/5',
      in_progress: 'text-[#0066cc] bg-[#0066cc]/10',
      revision_requested: 'text-[#003366] bg-[#003366]/10',
      completed: 'text-[#00ff94] bg-[#00ff94]/10'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white/70 hover:text-white"
              data-testid="project-back-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
              <span className="text-2xl font-bold text-white">BjBrands Studios</span>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-white/70 hover:text-white"
            data-testid="project-logout-btn"
          >
            Logout
          </Button>
        </div>

        {/* Project Info */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-8 mb-6" data-testid="project-info">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.service_type} Project</h1>
              <p className="text-[#a1a1aa]">Client: {project.client_name}</p>
              <p className="text-[#a1a1aa]">Deadline: {project.deadline}</p>
            </div>
            <span className={`text-sm px-4 py-2 rounded-full ${getStatusColor(project.status)}`} data-testid="project-status">
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Files Section */}
          <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Project Files</h2>
              {user?.role === 'client' && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                    disabled={uploading}
                    data-testid="project-upload-file-input"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#003366] hover:bg-[#004080] text-white pointer-events-none"
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </label>
              )}
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-[#a1a1aa] mx-auto mb-2" />
                <p className="text-[#a1a1aa] text-sm">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="project-files-list">
                {files.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4"
                    data-testid={`file-${file.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#003366]" />
                      <span className="text-white text-sm">{file.filename}</span>
                    </div>
                    <Button
                      onClick={() => downloadFile(file.id, file.filename)}
                      size="sm"
                      variant="ghost"
                      className="text-[#00ff94] hover:text-[#00ff94]/80"
                      data-testid={`download-file-${file.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revisions Section */}
          <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Revisions</h2>

            {user?.role === 'client' && (
              <form onSubmit={handleRevisionSubmit} className="mb-6" data-testid="revision-form">
                <Textarea
                  value={revisionMessage}
                  onChange={(e) => setRevisionMessage(e.target.value)}
                  placeholder="Describe what needs to be revised..."
                  className="bg-black/20 border-white/10 text-white mb-3 min-h-24"
                  data-testid="revision-message-input"
                />
                <Button
                  type="submit"
                  disabled={submittingRevision || !revisionMessage.trim()}
                  className="bg-[#d946ef] hover:bg-[#c026d3] text-white w-full"
                  data-testid="revision-submit-btn"
                >
                  {submittingRevision ? 'Submitting...' : 'Request Revision'}
                </Button>
              </form>
            )}

            {revisions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-[#a1a1aa] mx-auto mb-2" />
                <p className="text-[#a1a1aa] text-sm">No revision requests yet</p>
              </div>
            ) : (
              <div className="space-y-4" data-testid="revisions-list">
                {revisions.map(revision => (
                  <div
                    key={revision.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                    data-testid={`revision-${revision.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white font-medium text-sm">{revision.client_name}</span>
                      <span className="text-[#52525b] text-xs font-mono">
                        {new Date(revision.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#a1a1aa] text-sm">{revision.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}