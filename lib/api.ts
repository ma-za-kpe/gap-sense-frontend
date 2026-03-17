// GapSense API Client
// Connects to FastAPI backend running on localhost:8000 or production ALB

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * POST /demo/api/message
 * Send a teacher message (text or button click)
 */
export async function sendMessage(params: {
  message: string;
  teacher_phone: string;
  button_id?: string;
}): Promise<ApiResponse<any>> {
  try {
    const formData = new FormData();
    formData.append('message', params.message);
    formData.append('teacher_phone', params.teacher_phone);
    if (params.button_id) {
      formData.append('button_id', params.button_id);
    }

    const response = await fetch(`${API_BASE_URL}/demo/api/message`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * POST /demo/api/upload-image
 * Upload exercise book image
 */
export async function uploadImage(params: {
  image: File;
  teacher_phone: string;
}): Promise<ApiResponse<any>> {
  try {
    const formData = new FormData();
    formData.append('image', params.image);
    formData.append('teacher_phone', params.teacher_phone);

    const response = await fetch(`${API_BASE_URL}/demo/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET /demo/api/teacher-info
 * Get teacher info and conversation state
 */
export async function getTeacherInfo(teacher_phone: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/demo/api/teacher-info?teacher_phone=${encodeURIComponent(teacher_phone)}`
    );

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET /demo/api/status
 * Get class status overview
 */
export async function getClassStatus(teacher_phone: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/demo/api/status?teacher_phone=${encodeURIComponent(teacher_phone)}`
    );

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET /demo/reports/{teacher_phone}
 * Get teacher dashboard (HTML endpoint - use for iframe or navigation)
 */
export function getReportsUrl(teacher_phone: string): string {
  return `${API_BASE_URL}/demo/reports/${encodeURIComponent(teacher_phone)}`;
}

/**
 * GET /demo/api/reports/{phone}
 * Get teacher dashboard data (JSON version)
 */
export async function getTeacherReports(teacher_phone: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/demo/api/reports/${encodeURIComponent(teacher_phone)}`
    );

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET /demo/api/reports/{phone}/student/{id}
 * Get student detailed report (JSON version)
 */
export async function getStudentReport(
  teacher_phone: string,
  student_id: string
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/demo/api/reports/${encodeURIComponent(teacher_phone)}/student/${encodeURIComponent(student_id)}`
    );

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * GET /demo/api/curriculum
 * Get curriculum nodes (optionally filtered by grade)
 */
export async function getCurriculumNodes(grade?: string): Promise<ApiResponse<any>> {
  try {
    const url = grade
      ? `${API_BASE_URL}/demo/api/curriculum?grade=${encodeURIComponent(grade)}`
      : `${API_BASE_URL}/demo/api/curriculum`;

    const response = await fetch(url);

    const data = await response.json();
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
