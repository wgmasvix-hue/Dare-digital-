import { useState, useEffect } from 'react';
import { 
  Book, 
  Edit3, 
  FileText, 
  MoreVertical, 
  Plus, 
  Save, 
  Send, 
  Trash2,
  X,
  Eye,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Layout,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { oerService } from '../../services/oerService';

export default function PublishingDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor State
  const [editorContent, setEditorContent] = useState({
    title: '',
    description: '',
    content: '',
    status: 'draft'
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await oerService.getUserProjects(user.id);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProject({ isNew: true });
    setEditorContent({
      title: 'Untitled Project',
      description: '',
      content: '',
      status: 'draft'
    });
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setEditorContent({
      title: project.title,
      description: project.description || '',
      content: project.content_summary || '', // Using content_summary as a placeholder for content
      status: project.status || 'draft'
    });
  };

  const handleSave = async () => {
    try {
      const projectData = {
        title: editorContent.title,
        description: editorContent.description,
        content_summary: editorContent.content, // Storing content in summary for now
        status: editorContent.status,
        creator_id: user.id,
        // Default fields for new projects
        author_names: user.user_metadata?.full_name || 'Anonymous',
        subject: 'General',
        access_model: 'dare_access',
        publisher_name: 'Self-Published',
        publication_year: new Date().getFullYear()
      };

      if (editingProject.isNew) {
        await oerService.insertOER(projectData);
      } else {
        await oerService.updateProject(editingProject.id, projectData);
      }

      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  if (editingProject) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-300">
        {/* Editor Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setEditingProject(null)} 
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <input 
              type="text" 
              value={editorContent.title}
              onChange={(e) => setEditorContent({...editorContent, title: e.target.value})}
              className="text-xl font-bold text-gray-900 border-none focus:ring-0 placeholder-gray-400 w-96"
              placeholder="Untitled Project"
            />
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
              editorContent.status === 'published' ? 'bg-green-100 text-green-800' :
              editorContent.status === 'review' ? 'bg-amber-100 text-amber-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {editorContent.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 mr-2">
              {editorContent.content.split(/\s+/).filter(w => w.length > 0).length} words
            </span>
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <Save size={18} /> Save Draft
            </button>
            {editorContent.status === 'draft' && (
              <button 
                onClick={() => setEditorContent({...editorContent, status: 'review'})}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--navy)] text-white rounded-lg hover:bg-[var(--navy-mid)] font-medium transition-colors"
              >
                <Send size={18} /> Submit for Review
              </button>
            )}
            {editorContent.status === 'review' && (
              <button 
                onClick={() => setEditorContent({...editorContent, status: 'published'})}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <CheckCircle size={18} /> Publish Now
              </button>
            )}
          </div>
        </div>
        
        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden bg-[var(--cream)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white p-6 overflow-y-auto hidden lg:block">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Project Details</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={editorContent.description}
                  onChange={(e) => setEditorContent({...editorContent, description: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--navy)] focus:border-transparent outline-none transition-all"
                  rows={4}
                  placeholder="Brief summary of your work..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">Author</span>
                    <span className="text-sm font-medium text-gray-900">{user.user_metadata?.full_name || 'You'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">Last Edited</span>
                    <span className="text-sm font-medium text-gray-900">Just now</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase block mb-1">License</span>
                    <span className="text-sm font-medium text-gray-900">CC BY 4.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Editor Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-12 px-8">
              <textarea 
                value={editorContent.content}
                onChange={(e) => setEditorContent({...editorContent, content: e.target.value})}
                className="w-full min-h-[calc(100vh-200px)] resize-none border-none bg-transparent text-lg leading-relaxed text-gray-800 focus:ring-0 outline-none font-serif placeholder-gray-300"
                placeholder="Start writing your masterpiece..."
                style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const drafts = projects.filter(p => p.status === 'draft' || !p.status);
  const inReview = projects.filter(p => p.status === 'review');
  const published = projects.filter(p => p.status === 'published');

  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'all' || (p.status || 'draft') === activeTab;
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[var(--navy)] to-[var(--navy-mid)] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Editorial Dashboard</h2>
            <p className="text-white/80 max-w-xl text-lg opacity-90">
              Create, manage, and publish your institutional resources.
            </p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus size={20} /> New Project
          </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <Book size={300} className="-mr-10 -mt-10" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Drafts', value: drafts.length, icon: Edit3, color: 'text-gray-600', bg: 'bg-gray-100' },
          { label: 'In Review', value: inReview.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Published', value: published.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="flex gap-2 bg-gray-200/50 p-1 rounded-lg">
            {['all', 'draft', 'review', 'published'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[var(--navy)] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
              <button 
                onClick={handleCreateNew}
                className="text-[var(--navy)] font-medium hover:underline"
              >
                Create New Project
              </button>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors group flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    project.status === 'published' ? 'bg-green-100 text-green-600' :
                    project.status === 'review' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <Book size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[var(--navy)] transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Updated {new Date(project.updated_at || project.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                        project.status === 'published' ? 'bg-green-50 text-green-700 border border-green-100' :
                        project.status === 'review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {project.status || 'draft'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="p-2 text-gray-500 hover:text-[var(--navy)] hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={18} />
                  </button>
                  {project.status === 'published' && (
                    <button 
                      className="p-2 text-gray-500 hover:text-[var(--teal)] hover:bg-teal-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  <button 
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
