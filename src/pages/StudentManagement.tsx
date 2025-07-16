import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import AdminLayout from '../components/AdminLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

const StudentManagement: React.FC = () => {
  const { isAuthenticated, students, updateStudentStatus, sendEmail, exportData } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || student.courseName === selectedCourse;
    const matchesFormat = !selectedFormat || student.classFormat === selectedFormat;
    const matchesPaymentPlan = !selectedPaymentPlan || student.paymentPlan === selectedPaymentPlan;
    
    return matchesSearch && matchesCourse && matchesFormat && matchesPaymentPlan;
  });

  const uniqueCourses = [...new Set(students.map(s => s.courseName))];

  const handleStatusUpdate = (studentId: string, newStatus: string) => {
    updateStudentStatus(studentId, newStatus);
    setSelectedStudent(null);
  };

  const handleSendEmail = (studentId: string, type: string) => {
    sendEmail(studentId, type);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Formats</option>
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
              <select
                value={selectedPaymentPlan}
                onChange={(e) => setSelectedPaymentPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Plans</option>
                <option value="full">Full Payment</option>
                <option value="installment_2">Installment 2x</option>
                <option value="installment_3">Installment 3x</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
              <div className="flex items-center h-10 text-sm text-gray-600">
                <FunnelIcon className="h-4 w-4 mr-2" />
                {filteredStudents.length} student(s)
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Format</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cohort</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-800">{student.fullName}</div>
                        <div className="text-sm text-gray-600">{student.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{student.courseName}</td>
                    <td className="py-3 px-4 capitalize">{student.classFormat}</td>
                    <td className="py-3 px-4">{student.cohort}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{formatCurrency(student.finalAmount)}</div>
                        <div className="text-gray-600">{student.installmentProgress}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleSendEmail(student.id, 'reminder')}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-800">{selectedStudent.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-800">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-800">{selectedStudent.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Course</label>
                      <p className="text-gray-800">{selectedStudent.courseName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Format</label>
                      <p className="text-gray-800 capitalize">{selectedStudent.classFormat}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cohort</label>
                      <p className="text-gray-800">{selectedStudent.cohort}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Plan</label>
                      <p className="text-gray-800">{selectedStudent.paymentPlan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <p className="text-gray-800">{formatCurrency(selectedStudent.finalAmount)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Payment Progress</label>
                      <p className="text-gray-800">{selectedStudent.installmentProgress}</p>
                    </div>
                    {selectedStudent.voucherCode && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Voucher Used</label>
                        <p className="text-gray-800">{selectedStudent.voucherCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleSendEmail(selectedStudent.id, 'reminder')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedStudent.id, 'completed')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Mark Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentManagement;