import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../config";
import toast from 'react-hot-toast';

const SetupProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    username: '',
    age: '',
    phone: '',
    profileImage: null,
    previewUrl: null
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({
        ...profile,
        profileImage: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const loading = toast.loading("프로필 정보를 저장 중입니다...");
    
    const formData = new FormData();
    formData.append('username', profile.username);
    formData.append('age', profile.age);
    formData.append('phone', profile.phone);
    if (profile.profileImage) {
      formData.append('profileImage', profile.profileImage);
    }

    try {
      await axios.put(`${API_BASE_URL}/api/auth/profile-setup`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      toast.success("프로필 작성이 완료되었습니다!", { id: loading });
      navigate('/edit'); 
    } catch (err) {
      console.error('저장 실패:', err);
      toast.error(err.response?.data?.message || "프로필 저장 실패", { id: loading });
    }
  };

  return (
    /* 전체 배경: 다크모드일 때 bg-zinc-900 적용 */
    <div className="relative min-h-screen bg-gray-50 dark:bg-zinc-900 flex justify-center items-center p-12 overflow-hidden transition-colors duration-300">
      {/* 장식용 배경 원형도 다크모드에 맞춰 투명도 조절 */}
      <div className="w-[500px] h-[500px] absolute -right-20 -top-28 bg-blue-700/5 dark:bg-blue-500/10 rounded-full blur-[50px]"></div>
      <div className="w-96 h-96 absolute -left-32 bottom-20 bg-indigo-700/5 dark:bg-indigo-500/10 rounded-full blur-2xl"></div>

      <div className="w-full max-w-[672px] flex flex-col gap-12 z-10">
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
            <span className="text-blue-700 dark:text-blue-400 text-sm font-semibold uppercase tracking-tight">STEP 1: PROFILE DETAILS</span>
          </div>
          <h1 className="text-zinc-800 dark:text-zinc-100 text-5xl font-extrabold leading-[48px]">프로필을 완성해주세요</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base">One Resume에서 당신의 커리어 여정을 시작하기 위한 첫 번째 단계입니다.</p>
        </div>

        {/* 메인 카드: 다크모드일 때 배경색 및 보더 변경 */}
        <div className="relative bg-white dark:bg-zinc-800 rounded-[48px] shadow-sm border border-zinc-100 dark:border-zinc-700 p-12 pt-16 flex flex-col gap-8 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-t-[48px] overflow-hidden">
            <div className="w-1/3 h-full bg-blue-700 shadow-[0px_0px_12px_rgba(45,71,226,0.4)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="relative w-32 h-32 bg-gray-100 dark:bg-zinc-700 rounded-full border-2 border-zinc-200 dark:border-zinc-600 flex justify-center items-center cursor-pointer overflow-hidden group"
              >
                {profile.previewUrl && (
                  <img src={profile.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">프로필 사진 등록</span>
              <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
            </div>

            <div className="grid gap-6">
              {[
                { label: '이름 (Name)', name: 'username', placeholder: '홍길동', type: 'text' },
                { label: '나이 (Age)', name: 'age', placeholder: '28', type: 'number' },
                { label: '휴대폰 번호 (Phone)', name: 'phone', placeholder: '010-1234-5678', type: 'tel' },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label className="pl-1 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-wide">{field.label}</label>
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    /* 인풋창 색상 다크모드 적용 */
                    className="w-full px-6 py-4 bg-gray-100 dark:bg-zinc-700 rounded-[32px] text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium border border-transparent dark:border-zinc-600"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              <button 
                type="submit"
                className="w-full max-w-xs py-4 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-[48px] font-bold text-lg shadow-lg shadow-blue-700/20 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                다음 단계로 →
              </button>
              
              <div className="text-center text-neutral-400 dark:text-zinc-500 text-[10px] uppercase leading-4 tracking-tighter">
                By continuing, you agree to our <span className="text-zinc-600 dark:text-zinc-300 font-bold">Terms of Service</span> and <br/>
                <span className="text-zinc-600 dark:text-zinc-300 font-bold">Privacy Policy</span>.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupProfile;