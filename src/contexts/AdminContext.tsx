import React, { createContext, useContext, useState, useEffect } from 'react';

interface Admin {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
}

interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  classFormat: 'virtual' | 'physical';
  cohort: string;
  paymentPlan: string;
  totalAmount: number;
  finalAmount: number;
  currentPayment: number;
  installmentProgress: string;
  voucherCode: string;
  status: string;
  createdAt: string;
}

interface AdminContextType {
  students: Student[];
  admins: Admin[];
  isAuthenticated: boolean;
  currentAdmin: Admin | null;
  login: (password: string) => boolean;
  loginWithUsername: (username: string, password: string) => boolean;
  logout: () => void;
  createAdmin: (username: string, password: string, role: 'admin' | 'super_admin') => boolean;
  deleteAdmin: (adminId: string) => boolean;
  changeAdminPassword: (adminId: string, newPassword: string) => boolean;
  getAnalytics: () => any;
  updateStudentStatus: (id: string, status: string) => void;
  sendEmail: (studentId: string, type: string) => void;
  bulkEmail: (cohort: string, message: string) => void;
  exportData: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    // Load students from localStorage
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    setStudents(storedPayments);
    
    // Check authentication
    const authStatus = localStorage.getItem('adminAuth');
    const currentAdminData = localStorage.getItem('currentAdmin');
    
    if (authStatus === 'true' && currentAdminData) {
      setIsAuthenticated(true);
      setCurrentAdmin(JSON.parse(currentAdminData));
    }

    // Initialize default super admin and load existing admins
    const storedAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (storedAdmins.length === 0) {
      // Create default super admin
      const defaultSuperAdmin: Admin = {
        id: 'super_admin_1',
        username: 'superadmin',
        role: 'super_admin',
        createdAt: new Date().toISOString()
      };
      const initialAdmins = [defaultSuperAdmin];
      setAdmins(initialAdmins);
      localStorage.setItem('admins', JSON.stringify(initialAdmins));
      localStorage.setItem('admin_passwords', JSON.stringify({
        'super_admin_1': 'admin123'
      }));
    } else {
      setAdmins(storedAdmins);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      const legacyAdmin: Admin = {
        id: 'legacy_admin',
        username: 'admin',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setCurrentAdmin(legacyAdmin);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('currentAdmin', JSON.stringify(legacyAdmin));
      return true;
    }
    return false;
  };

  const loginWithUsername = (username: string, password: string): boolean => {
    const admin = admins.find(a => a.username === username);
    if (!admin) return false;

    const passwords = JSON.parse(localStorage.getItem('admin_passwords') || '{}');
    if (passwords[admin.id] === password) {
      const updatedAdmin = { ...admin, lastLogin: new Date().toISOString() };
      setIsAuthenticated(true);
      setCurrentAdmin(updatedAdmin);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
      
      // Update admin's last login
      const updatedAdmins = admins.map(a => a.id === admin.id ? updatedAdmin : a);
      setAdmins(updatedAdmins);
      localStorage.setItem('admins', JSON.stringify(updatedAdmins));
      
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('currentAdmin');
  };

  const createAdmin = (username: string, password: string, role: 'admin' | 'super_admin'): boolean => {
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return false; // Only super admin can create admins
    }

    // Check if username already exists
    if (admins.some(a => a.username === username)) {
      return false;
    }

    const newAdmin: Admin = {
      id: `admin_${Date.now()}`,
      username,
      role,
      createdAt: new Date().toISOString()
    };

    const updatedAdmins = [...admins, newAdmin];
    setAdmins(updatedAdmins);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));

    // Store password
    const passwords = JSON.parse(localStorage.getItem('admin_passwords') || '{}');
    passwords[newAdmin.id] = password;
    localStorage.setItem('admin_passwords', JSON.stringify(passwords));

    return true;
  };

  const deleteAdmin = (adminId: string): boolean => {
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return false; // Only super admin can delete admins
    }

    if (adminId === currentAdmin.id) {
      return false; // Cannot delete self
    }

    const updatedAdmins = admins.filter(a => a.id !== adminId);
    setAdmins(updatedAdmins);
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));

    // Remove password
    const passwords = JSON.parse(localStorage.getItem('admin_passwords') || '{}');
    delete passwords[adminId];
    localStorage.setItem('admin_passwords', JSON.stringify(passwords));

    return true;
  };

  const changeAdminPassword = (adminId: string, newPassword: string): boolean => {
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return false; // Only super admin can change passwords
    }

    const passwords = JSON.parse(localStorage.getItem('admin_passwords') || '{}');
    passwords[adminId] = newPassword;
    localStorage.setItem('admin_passwords', JSON.stringify(passwords));

    return true;
  };

  const getAnalytics = () => {
    const totalStudents = students.length;
    const totalRevenue = students.reduce((sum, student) => sum + student.finalAmount, 0);
    
    const courseBreakdown = students.reduce((acc, student) => {
      acc[student.courseName] = (acc[student.courseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const highestPaidCourse = Object.entries(courseBreakdown)
      .sort(([,a], [,b]) => b - a)[0];
    
    const vouchersUsed = students.filter(s => s.voucherCode).length;
    
    return {
      totalStudents,
      totalRevenue,
      courseBreakdown,
      highestPaidCourse: highestPaidCourse ? highestPaidCourse[0] : 'N/A',
      vouchersUsed,
    };
  };

  const updateStudentStatus = (id: string, status: string) => {
    const updatedStudents = students.map(student =>
      student.id === id ? { ...student, status } : student
    );
    setStudents(updatedStudents);
    localStorage.setItem('payments', JSON.stringify(updatedStudents));
  };

  const sendEmail = (studentId: string, type: string) => {
    // Simulate sending email
    console.log(`Sending ${type} email to student ${studentId}`);
    alert(`${type} email sent successfully!`);
  };

  const bulkEmail = (cohort: string, message: string) => {
    // Simulate bulk email
    const cohortStudents = students.filter(s => s.cohort === cohort);
    console.log(`Sending bulk email to ${cohortStudents.length} students in ${cohort} cohort`);
    alert(`Bulk email sent to ${cohortStudents.length} students in ${cohort} cohort!`);
  };

  const exportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Course', 'Format', 'Cohort', 'Payment Plan', 'Amount', 'Status'],
      ...students.map(s => [
        s.fullName, s.email, s.phone, s.courseName, s.classFormat, 
        s.cohort, s.paymentPlan, s.finalAmount, s.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminContext.Provider value={{
      students,
      admins,
      isAuthenticated,
      currentAdmin,
      login,
      loginWithUsername,
      logout,
      createAdmin,
      deleteAdmin,
      changeAdminPassword,
      getAnalytics,
      updateStudentStatus,
      sendEmail,
      bulkEmail,
      exportData,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};