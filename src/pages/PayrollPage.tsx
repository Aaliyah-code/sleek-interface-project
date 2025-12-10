import { useState, useRef } from "react";
import { Search, Download, FileText, Clock, DollarSign, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { employeeData, payrollData, PayrollRecord, Employee } from "@/data/employees";
import { useToast } from "@/hooks/use-toast";

interface EnrichedPayroll extends PayrollRecord {
  employee: Employee;
}

export default function PayrollPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<EnrichedPayroll | null>(null);
  const payslipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const enrichedPayroll: EnrichedPayroll[] = payrollData.map((payroll) => ({
    ...payroll,
    employee: employeeData.find((emp) => emp.employeeId === payroll.employeeId)!,
  }));

  const filteredPayroll = enrichedPayroll.filter((p) =>
    p.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPayroll = enrichedPayroll.reduce((sum, p) => sum + p.finalSalary, 0);
  const totalHours = enrichedPayroll.reduce((sum, p) => sum + p.hoursWorked, 0);
  const totalDeductions = enrichedPayroll.reduce((sum, p) => sum + p.leaveDeductions, 0);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleDownloadPayslip = () => {
    toast({
      title: "Payslip Downloaded",
      description: `Payslip for ${selectedPayslip?.employee.name} has been downloaded.`,
    });
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (p: EnrichedPayroll) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent/10 text-accent text-sm font-medium">
              {getInitials(p.employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{p.employee.name}</p>
            <p className="text-sm text-muted-foreground">{p.employee.position}</p>
          </div>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (p: EnrichedPayroll) => p.employee.department },
    {
      key: "hoursWorked",
      header: "Hours Worked",
      render: (p: EnrichedPayroll) => `${p.hoursWorked}h`,
    },
    {
      key: "baseSalary",
      header: "Base Salary",
      render: (p: EnrichedPayroll) => `R${p.employee.salary.toLocaleString()}`,
    },
    {
      key: "leaveDeductions",
      header: "Deductions",
      render: (p: EnrichedPayroll) => (
        <span className="text-destructive">-R{(p.employee.salary - p.finalSalary).toLocaleString()}</span>
      ),
    },
    {
      key: "finalSalary",
      header: "Final Salary",
      render: (p: EnrichedPayroll) => (
        <span className="font-bold text-accent">R{p.finalSalary.toLocaleString()}</span>
      ),
    },
    {
      key: "actions",
      header: "Payslip",
      render: (p: EnrichedPayroll) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedPayslip(p)}>
          <FileText className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  const renderCard = (p: EnrichedPayroll) => (
    <Card className="hover-lift">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">
                {getInitials(p.employee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{p.employee.name}</p>
              <p className="text-xs text-muted-foreground truncate">{p.employee.position}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedPayslip(p)}>
            <FileText className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Hours</p>
            <p className="font-medium">{p.hoursWorked}h</p>
          </div>
          <div>
            <p className="text-muted-foreground">Deductions</p>
            <p className="font-medium text-destructive">-R{(p.employee.salary - p.finalSalary).toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-accent">R{p.finalSalary.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Final Salary</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">R{(totalPayroll / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-sm text-muted-foreground">Total Hours Worked</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDeductions}h</p>
              <p className="text-sm text-muted-foreground">Leave Deductions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <DataTable
        data={filteredPayroll}
        columns={columns}
        keyExtractor={(p) => p.employeeId}
        cardRender={renderCard}
      />

      {/* Payslip Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Digital Payslip</DialogTitle>
          </DialogHeader>

          {selectedPayslip && (
            <div ref={payslipRef} className="space-y-6 py-4">
              {/* Company Header */}
              <div className="text-center pb-4 border-b border-border">
                <h2 className="text-xl font-bold">ModernTech Solutions</h2>
                <p className="text-sm text-muted-foreground">
                  Monthly Payslip - {new Date().toLocaleDateString("en-ZA", { month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee Name</p>
                  <p className="font-medium">{selectedPayslip.employee.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employee ID</p>
                  <p className="font-medium">EMP-{String(selectedPayslip.employeeId).padStart(4, "0")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedPayslip.employee.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Position</p>
                  <p className="font-medium">{selectedPayslip.employee.position}</p>
                </div>
              </div>

              <Separator />

              {/* Earnings */}
              <div>
                <h3 className="font-semibold mb-3">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span>R{selectedPayslip.employee.salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hours Worked</span>
                    <span>{selectedPayslip.hoursWorked} hours</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Deductions */}
              <div>
                <h3 className="font-semibold mb-3">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Leave Deductions ({selectedPayslip.leaveDeductions} hours)</span>
                    <span className="text-destructive">
                      -R{(selectedPayslip.employee.salary - selectedPayslip.finalSalary).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Net Pay */}
              <div className="bg-accent/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Net Pay</span>
                  <span className="text-2xl font-bold text-accent">
                    R{selectedPayslip.finalSalary.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                <p>This is a computer-generated payslip and does not require a signature.</p>
                <p className="mt-1">Generated on {new Date().toLocaleDateString("en-ZA")}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedPayslip(null)}>
              Close
            </Button>
            <Button onClick={handleDownloadPayslip}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
