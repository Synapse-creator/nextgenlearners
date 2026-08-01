"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { classes } from '@/lib/subjects';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import AddStudentForm from './add-student-form';
import AddTeacherForm from './add-teacher-form';
import { Separator } from '../ui/separator';

interface Student {
  uid: string;
  name: string;
  email: string;
  class?: string;
  avatarUrl?: string;
  teacher_id?: string;
}

interface Teacher {
  uid: string;
  name: string;
  email: string;
}

interface StudentListProps {
  isAdminTeacher?: boolean;
}

const avatarGifs = ['/avatars/avatar1.gif', '/avatars/avatar2.gif', '/avatars/avatar3.gif'];
const getRandomAvatar = () => avatarGifs[Math.floor(Math.random() * avatarGifs.length)];

export default function StudentList({ isAdminTeacher = false }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const { toast } = useToast();


  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student');

      if (error) {
        console.warn("Supabase fetch notice:", error.message);
      }

      if (data && data.length > 0) {
        const studentList: Student[] = data.map((doc: any) => ({
          uid: doc.uid || doc.id,
          name: doc.name,
          email: doc.email,
          class: doc.class_name || doc.class,
          avatarUrl: getRandomAvatar(),
          teacher_id: doc.teacher_id,
        }));
        setStudents(studentList);
      } else {
        setStudents([]);
      }
      setError(null);
    } catch (err: any) {
      console.warn("Error fetching students:", err);
      setStudents([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    const fetchTeachers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('*').in('role', ['teacher', 'admin_teacher']);
            if (data) {
                setTeachers(data.map(doc => ({ uid: doc.uid || doc.id, name: doc.name, email: doc.email })));
            }
        } catch (e) {
            console.error("Error fetching teachers", e);
        }
    };
    fetchTeachers();

    // Subscribe to realtime updates on users table
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleClassAssign = async (studentId: string, className: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ class_name: className })
        .eq('uid', studentId);

      if (error) throw error;

      setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, class: className } : s));

      toast({
        title: "Class Assigned!",
        description: `Successfully assigned class ${className}.`,
      });
    } catch (err) {
      console.error("Error assigning class:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not assign class.",
      });
    }
  };

  const handleTeacherAssign = async (studentId: string, teacherId: string | null) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ teacher_id: teacherId })
        .eq('uid', studentId);

      if (error) throw error;

      setStudents(prev => prev.map(s => s.uid === studentId ? { ...s, teacher_id: teacherId || undefined } : s));

      toast({
        title: "Teacher Assigned!",
        description: `Successfully assigned teacher.`,
      });
    } catch (err) {
      console.error("Error assigning teacher:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not assign teacher.",
      });
    }
  };

  const filteredStudents = classFilter === "all" 
    ? students 
    : students.filter(student => student.class === classFilter);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-6 h-6" />
                Student Roster
                </CardTitle>
                <CardDescription>
                View, manage, and add new students to your roster.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                        <SelectValue placeholder="Filter by class..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        {classes.map((className) => (
                            <SelectItem key={className} value={className}>
                                {className}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isAdminTeacher && (
                  <div className="flex items-center gap-2">
                    <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <PlusCircle className="w-4 h-4 mr-2 text-primary" />
                          Add Teacher
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <AddTeacherForm setOpen={setIsAddTeacherOpen} />
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto font-bold btn-bounce">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <AddStudentForm setOpen={setIsAddStudentOpen} />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <div key={student.uid} className="p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={student.avatarUrl} alt={student.name} />
                    <AvatarFallback>{student.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/teacher/student/${student.uid}`} className="font-semibold hover:underline text-primary">
                      {student.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex flex-col gap-2">
                    <div className="text-sm">
                        <span className="font-medium">Class: </span>
                        <span className="text-muted-foreground font-bold">{student.class || 'Unassigned'}</span>
                    </div>
                    {isAdminTeacher ? (
                      <div className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Assign Class</label>
                            <Select
                                defaultValue={student.class}
                                onValueChange={(value) => handleClassAssign(student.uid, value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                {classes.map((className) => (
                                    <SelectItem key={className} value={className}>
                                    {className}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Assign Teacher</label>
                            <Select
                                defaultValue={student.teacher_id || "unassigned"}
                                onValueChange={(value) => handleTeacherAssign(student.uid, value === "unassigned" ? null : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.uid} value={teacher.uid}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Only Admin Teachers can modify class assignments.</p>
                    )}
                </div>
              </div>
            ))
          ) : (
             <div className="h-24 text-center flex items-center justify-center">
                <p>No students found for this filter.</p>
             </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Class</TableHead>
                {isAdminTeacher && (
                  <>
                    <TableHead className="w-[150px] sm:w-[200px]">Assign Class</TableHead>
                    <TableHead className="w-[150px] sm:w-[200px]">Assign Teacher</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.uid}>
                    <TableCell>
                      <Avatar>
                         <AvatarImage src={student.avatarUrl} alt={student.name} />
                        <AvatarFallback>{student.name?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/teacher/student/${student.uid}`} className="hover:underline text-primary">
                        {student.name}
                      </Link>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell><span className="px-2.5 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">{student.class || 'Unassigned'}</span></TableCell>
                    {isAdminTeacher && (
                      <>
                        <TableCell>
                          <Select
                            defaultValue={student.class}
                            onValueChange={(value) => handleClassAssign(student.uid, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((className) => (
                                <SelectItem key={className} value={className}>
                                  {className}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            defaultValue={student.teacher_id || "unassigned"}
                            onValueChange={(value) => handleTeacherAssign(student.uid, value === "unassigned" ? null : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {teachers.map((teacher) => (
                                  <SelectItem key={teacher.uid} value={teacher.uid}>
                                      {teacher.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdminTeacher ? 6 : 4} className="h-24 text-center">
                    No students found for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
