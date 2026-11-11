'use client';

import React, { useState } from 'react';
import {
  X,
  Lock,
  Phone,
  Mail,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { loginApi, registerApi } from '../../lib/api';
import { KERALA_DISTRICTS, EXTENDED_KERALA_LOCALITIES } from '../../lib/geolocation';
import { User } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    language,
    login,
  } = useAppStore();
  const t = getT(language);

  const [mode, setMode] = useState<'login' | 'register'>(
    authModalMode === 'register' ? 'register' : 'login'
  );

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('+919846000001');
  const [loginPassword, setLoginPassword] = useState('KeralaCivic2026!');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState<'CITIZEN' | 'DEPARTMENT_OFFICIAL'>('CITIZEN');
  const [district, setDistrict] = useState('Ernakulam');
  const [locality, setLocality] = useState('Kakkanad');

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginApi({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });

      const backendUser = res.user;
      const mappedUser: User = {
        id: backendUser.id,
        fullName: backendUser.fullName,
        username: backendUser.email?.split('@')[0] || backendUser.phone.slice(-6),
        email: backendUser.email,
        phone: backendUser.phone,
        role: backendUser.role,
        district: backendUser.district,
        locality: backendUser.locality,
        avatarUrl: backendUser.avatarUrl || '',
        bio: backendUser.bio || '',
        interests: [],
        followersCount: 0,
        followingCount: 0,
        grievancesCount: 0,
        postsCount: 0,
        preferredLang: (backendUser.preferredLang as any) || 'ml',
      };

      login(mappedUser);
      setSuccessMessage('Successfully signed in!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMessage(null);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify phone/email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await registerApi({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : undefined,
        password: registerPassword,
        district,
        locality,
        role,
        preferredLang: language,
      });

      const backendUser = res.user;
      const mappedUser: User = {
        id: backendUser.id,
        fullName: backendUser.fullName,
        username: backendUser.email?.split('@')[0] || backendUser.phone.slice(-6),
        email: backendUser.email,
        phone: backendUser.phone,
        role: backendUser.role,
        district: backendUser.district,
        locality: backendUser.locality,
        avatarUrl: backendUser.avatarUrl || '',
        bio: '',
        interests: [],
        followersCount: 0,
        followingCount: 0,
        grievancesCount: 0,
        postsCount: 0,
        preferredLang: (backendUser.preferredLang as any) || 'ml',
      };

      login(mappedUser);
      setSuccessMessage('Account registered and logged in!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMessage(null);
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Phone or email might already be taken.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden p-6 shadow-2xl border border-[#E6EEE8] space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6EEE8]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E9F8ED] text-[#087A45]">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#17251D]">
                {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
              </h3>
              <p className="text-[11px] text-[#77847C]">{t.appTagline}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-full hover:bg-[#F7FAF7] text-[#77847C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-[#F7FAF7] rounded-2xl border border-[#E6EEE8]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-[#087A45] shadow-xs'
                : 'text-[#77847C] hover:text-[#17251D]'
            }`}
          >
            {t.auth.signIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-[#087A45] shadow-xs'
                : 'text-[#77847C] hover:text-[#17251D]'
            }`}
          >
            {t.auth.register}
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#17251D]">
                {t.auth.phoneOrEmail}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#77847C] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={t.auth.phoneOrEmailPlaceholder}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] placeholder-[#77847C] outline-none focus:border-[#087A45] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#17251D]">
                  {t.auth.password}
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#77847C] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder={t.auth.passwordPlaceholder}
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] placeholder-[#77847C] outline-none focus:border-[#087A45] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#77847C] hover:text-[#17251D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#087A45] text-white font-bold text-sm shadow-md shadow-[#087A45]/30 hover:bg-[#064B2E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Neon DB...</span>
                </>
              ) : (
                <>
                  <span>{t.auth.loginCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#17251D]">
                {t.auth.fullName} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#77847C] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.auth.fullNamePlaceholder}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none focus:border-[#087A45]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17251D]">
                  {t.auth.phone} *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#77847C] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full pl-8 pr-2.5 py-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none focus:border-[#087A45]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17251D]">
                  {t.auth.email}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#77847C] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@..."
                    className="w-full pl-8 pr-2.5 py-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none focus:border-[#087A45]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#17251D]">
                {t.auth.password} (min 6 chars) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#77847C] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none focus:border-[#087A45]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#77847C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Radio Picker */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#17251D]">
                {t.auth.role}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CITIZEN')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'CITIZEN'
                      ? 'bg-[#E9F8ED] border-[#087A45] text-[#087A45]'
                      : 'bg-[#F7FAF7] border-[#E6EEE8] text-[#77847C]'
                  }`}
                >
                  {t.auth.citizen}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DEPARTMENT_OFFICIAL')}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'DEPARTMENT_OFFICIAL'
                      ? 'bg-[#E9F8ED] border-[#087A45] text-[#087A45]'
                      : 'bg-[#F7FAF7] border-[#E6EEE8] text-[#77847C]'
                  }`}
                >
                  {t.auth.official}
                </button>
              </div>
            </div>

            {/* District & Locality Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17251D]">
                  {t.auth.district}
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    const d = e.target.value;
                    setDistrict(d);
                    const match = EXTENDED_KERALA_LOCALITIES.find((l) => l.district === d);
                    if (match) setLocality(match.name);
                  }}
                  className="w-full p-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#17251D]">
                  {t.auth.locality}
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs text-[#17251D] outline-none"
                >
                  {EXTENDED_KERALA_LOCALITIES.filter((l) => l.district === district).map((l) => (
                    <option key={l.name} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                  {!EXTENDED_KERALA_LOCALITIES.some((l) => l.name === locality) && (
                    <option value={locality}>{locality}</option>
                  )}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#087A45] text-white font-bold text-sm shadow-md shadow-[#087A45]/30 hover:bg-[#064B2E] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Account on Neon DB...</span>
                </>
              ) : (
                <>
                  <span>{t.auth.registerCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

