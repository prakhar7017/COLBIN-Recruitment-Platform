import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import type { ProfileFormData } from '../../types';

const Profile = () => {
  const { state, loadUser } = useAuth();
  const { user, loading: authLoading } = state;
  
  // Initialize with empty values
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    skills: [],
    experience: 0,
    education: '',
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Create a stable reference to loadUser to avoid dependency issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableLoadUser = () => loadUser();
  
  // Try to load user data if not already loaded
  useEffect(() => {
    if (!user && !authLoading && localStorage.getItem('token')) {
      stableLoadUser();
    }
  }, [user, authLoading, stableLoadUser]);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        skills: user.skills || [],
        experience: user.experience || 0,
        education: user.education || '',
      });
    }
  }, [user]);

  const { name, skills, experience, education } = formData;

  const onChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      await axios.put('/api/users/profile', formData, config);
      
      // Reload user data
      await loadUser();
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully',
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  // Show a better loading state with spinner
  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading profile...</p>
        {!authLoading && localStorage.getItem('token') && (
          <button 
            onClick={() => {
              // Force reload user data
              stableLoadUser();
            }}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry Loading Profile
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">User Profile</h1>
      
      {message.text && (
        <div
          className={`${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          } border px-4 py-3 rounded mb-4`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email (cannot be changed)
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight bg-gray-100"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Skills</label>
          <div className="flex">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Add a skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2 flex items-center"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
            Years of Experience
          </label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={experience}
            onChange={onChange}
            min="0"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="education">
            Education
          </label>
          <textarea
            id="education"
            name="education"
            value={education}
            onChange={onChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            placeholder="Your educational background"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
