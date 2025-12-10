import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Mail, Building, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeData as initialData, Employee } from "@/data/employees";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const departments = ["Development", "HR", "QA", "Sales", "Marketing", "Design", "IT", "Finance", "Support"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.position?.trim()) newErrors.position = "Position is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.salary || formData.salary <= 0) newErrors.salary = "Valid salary is required";
    if (!formData.contact?.trim()) newErrors.contact = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact)) newErrors.contact = "Invalid email format";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData(employee);
    } else {
      setEditingEmployee(null);
      setFormData({
        employeeId: Math.max(...employees.map((e) => e.employeeId)) + 1,
        name: "",
        position: "",
        department: "",
        salary: 0,
        employmentHistory: `Joined in ${new Date().getFullYear()}`,
        contact: "",
      });
    }
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.employeeId === editingEmployee.employeeId ? { ...emp, ...formData } as Employee : emp
        )
      );
      toast({ title: "Employee updated", description: `${formData.name}'s information has been updated.` });
    } else {
      setEmployees((prev) => [...prev, formData as Employee]);
      toast({ title: "Employee added", description: `${formData.name} has been added to the system.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (employee: Employee) => {
    setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employee.employeeId));
    toast({
      title: "Employee removed",
      description: `${employee.name} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (emp: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent/10 text-accent text-sm font-medium">
              {getInitials(emp.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{emp.name}</p>
            <p className="text-sm text-muted-foreground">{emp.contact}</p>
          </div>
        </div>
      ),
    },
    { key: "position", header: "Position" },
    { key: "department", header: "Department" },
    {
      key: "salary",
      header: "Salary",
      render: (emp: Employee) => `R${emp.salary.toLocaleString()}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (emp: Employee) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(emp)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp)} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const renderCard = (emp: Employee) => (
    <Card className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                {getInitials(emp.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{emp.name}</p>
              <p className="text-sm text-muted-foreground">{emp.position}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(emp)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(emp)} className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="w-4 h-4" />
            <span>{emp.department}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{emp.contact}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{emp.employmentHistory}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-lg font-bold text-accent">R{emp.salary.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Monthly Salary</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Table/Cards */}
      <DataTable
        data={filteredEmployees}
        columns={columns}
        keyExtractor={(emp) => emp.employeeId}
        cardRender={renderCard}
      />

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Job title"
                />
                {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="salary">Monthly Salary (ZAR)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ""}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                placeholder="50000"
              />
              {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="contact">Email Address</Label>
              <Input
                id="contact"
                type="email"
                value={formData.contact || ""}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="email@moderntech.com"
              />
              {errors.contact && <p className="text-sm text-destructive">{errors.contact}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingEmployee ? "Save Changes" : "Add Employee"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
