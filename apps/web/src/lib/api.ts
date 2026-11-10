const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchLivePosts(locality?: string) {
  try {
    const url = new URL(`${API_BASE}/posts`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable, using client state:', error);
    return null;
  }
}

export async function fetchLiveIssues(locality?: string) {
  try {
    const url = new URL(`${API_BASE}/issues`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch issues');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return null;
  }
}

export async function fetchLiveConflicts(locality?: string) {
  try {
    const url = new URL(`${API_BASE}/projects/conflicts`);
    if (locality) url.searchParams.set('locality', locality);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch conflicts');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return null;
  }
}

export async function fetchLiveDepartments() {
  try {
    const res = await fetch(`${API_BASE}/departments`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch departments');
    return await res.json();
  } catch (error) {
    console.warn('Backend API offline or unreachable:', error);
    return null;
  }
}

