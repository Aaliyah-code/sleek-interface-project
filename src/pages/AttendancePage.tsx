import { useState } from "react";
import { Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { attendanceData as initialData, EmployeeAttendance, LeaveRequest } from "@/data/employees";
import { useToast } from "@/hooks/use-toast";

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredRecords = attendanceRecords.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleLeaveAction = (employeeId: number, leaveDate: string, action: "Approved" | "Denied") => {
    setAttendanceRecords((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId
          ? {
              ...emp,
              leaveRequests: emp.leaveRequests.map((leave) =>
                leave.date === leaveDate ? { ...leave, status: action } : leave
              ),
            }
          : emp
      )
    );
    toast({
      title: `Leave ${action}`,
      description: `The leave request has been ${action.toLowerCase()}.`,
    });
  };

  // All leave requests flattened
  const allLeaveRequests = attendanceRecords.flatMap((emp) =>
    emp.leaveRequests.map((leave) => ({
      ...leave,
      employeeId: emp.employeeId,
      employeeName: emp.name,
    }))
  );

  const pendingLeaves = allLeaveRequests.filter((l) => l.status === "Pending");

  const leaveColumns = [
    {
      key: "employeeName",
      header: "Employee",
      render: (leave: typeof allLeaveRequests[0]) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-accent/10 text-accent text-xs font-medium">
              {getInitials(leave.employeeName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{leave.employeeName}</span>
        </div>
      ),
    },
    { key: "reason", header: "Reason" },
    {
      key: "date",
      header: "Date",
      render: (leave: typeof allLeaveRequests[0]) =>
        new Date(leave.date).toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "status",
      header: "Status",
      render: (leave: typeof allLeaveRequests[0]) => <StatusBadge status={leave.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (leave: typeof allLeaveRequests[0]) =>
        leave.status === "Pending" ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-success hover:bg-success/10 hover:text-success"
              onClick={() => handleLeaveAction(leave.employeeId, leave.date, "Approved")}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleLeaveAction(leave.employeeId, leave.date, "Denied")}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Deny
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No action needed</span>
        ),
    },
  ];

  const renderLeaveCard = (leave: typeof allLeaveRequests[0]) => (
    <Card className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent/10 text-accent font-medium">
                {getInitials(leave.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{leave.employeeName}</p>
              <p className="text-sm text-muted-foreground">{leave.reason}</p>
            </div>
          </div>
          <StatusBadge status={leave.status} />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(leave.date).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {leave.status === "Pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-success hover:bg-success/90"
              onClick={() => handleLeaveAction(leave.employeeId, leave.date, "Approved")}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => handleLeaveAction(leave.employeeId, leave.date, "Denied")}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Deny
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allLeaveRequests.filter((l) => l.status === "Approved").length}</p>
              <p className="text-sm text-muted-foreground">Approved Leaves</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingLeaves.length}</p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allLeaveRequests.filter((l) => l.status === "Denied").length}</p>
              <p className="text-sm text-muted-foreground">Denied Leaves</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="leave" className="relative">
            Leave Requests
            {pendingLeaves.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                {pendingLeaves.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4">
            {filteredRecords.map((emp, index) => (
              <Card key={emp.employeeId} className="hover-lift animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-accent/10 text-accent font-medium">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{emp.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {emp.attendance.map((att) => (
                      <div
                        key={att.date}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          att.status === "Present"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(att.date).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {att.status === "Present" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <DataTable
            data={allLeaveRequests.sort((a, b) => {
              if (a.status === "Pending" && b.status !== "Pending") return -1;
              if (a.status !== "Pending" && b.status === "Pending") return 1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })}
            columns={leaveColumns}
            keyExtractor={(leave) => `${leave.employeeId}-${leave.date}`}
            cardRender={renderLeaveCard}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
