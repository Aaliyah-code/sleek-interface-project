import { Users, CalendarCheck, Wallet, TrendingUp, Clock, UserCheck } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeData, attendanceData, payrollData } from "@/data/employees";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function DashboardPage() {
  // Calculate stats
  const totalEmployees = employeeData.length;
  const totalPayroll = payrollData.reduce((sum, p) => sum + p.finalSalary, 0);
  
  // Calculate attendance rate
  const allAttendance = attendanceData.flatMap((e) => e.attendance);
  const presentCount = allAttendance.filter((a) => a.status === "Present").length;
  const attendanceRate = Math.round((presentCount / allAttendance.length) * 100);

  // Pending leave requests
  const pendingLeaves = attendanceData
    .flatMap((e) => e.leaveRequests)
    .filter((l) => l.status === "Pending").length;

  // Department distribution
  const departmentCounts = employeeData.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--accent))",
  ];

  // Payroll by department
  const payrollByDept = employeeData.reduce((acc, emp) => {
    const payroll = payrollData.find((p) => p.employeeId === emp.employeeId);
    if (payroll) {
      acc[emp.department] = (acc[emp.department] || 0) + payroll.finalSalary;
    }
    return acc;
  }, {} as Record<string, number>);

  const payrollChartData = Object.entries(payrollByDept).map(([dept, amount]) => ({
    department: dept,
    amount: amount / 1000,
  }));

  // Recent leave requests
  const recentLeaves = attendanceData
    .flatMap((e) => e.leaveRequests.map((l) => ({ ...l, employeeName: e.name })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={UserCheck}
          trend={{ value: 3, isPositive: true }}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Pending Leaves"
          value={pendingLeaves}
          icon={Clock}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Monthly Payroll"
          value={`R${(totalPayroll / 1000).toFixed(0)}K`}
          icon={Wallet}
          trend={{ value: 5, isPositive: true }}
          iconClassName="bg-accent/10 text-accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll by Department */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Payroll by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tickFormatter={(v) => `R${v}K`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="department" type="category" width={80} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [`R${value}K`, "Amount"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Employees by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-accent" />
            Recent Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeaves.map((leave, index) => (
              <div
                key={`${leave.employeeName}-${leave.date}`}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-accent font-semibold text-sm">
                      {leave.employeeName.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{leave.employeeName}</p>
                    <p className="text-sm text-muted-foreground">{leave.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      leave.status === "Approved"
                        ? "bg-success/10 text-success"
                        : leave.status === "Denied"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {leave.status}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(leave.date).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
