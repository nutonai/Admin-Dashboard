"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: "Starter" | "Pro" | "Ultra";
  status: "Paid" | "Pending" | "Failed";
  lastLogin: string;
};

const users: User[] = [
  {
    id: "u_01",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    company: "Acme Inc.",
    plan: "Pro",
    status: "Paid",
    lastLogin: "2023-09-01T10:30:00",
  },
  {
    id: "u_02",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    company: "Globex Corp",
    plan: "Starter",
    status: "Pending",
    lastLogin: "2023-09-02T14:20:00",
  },
  {
    id: "u_03",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    company: "Initech",
    plan: "Ultra",
    status: "Paid",
    lastLogin: "2023-09-03T09:15:00",
  },
  {
    id: "u_04",
    name: "William Kim",
    email: "will@email.com",
    company: "Massive Dynamic",
    plan: "Pro",
    status: "Failed",
    lastLogin: "2023-09-01T16:45:00",
  },
  {
    id: "u_05",
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    company: "Hooli",
    plan: "Starter",
    status: "Paid",
    lastLogin: "2023-09-02T11:10:00",
  },
  {
    id: "u_06",
    name: "Ethan Johnson",
    email: "ethan.johnson@email.com",
    company: "Stark Industries",
    plan: "Ultra",
    status: "Paid",
    lastLogin: "2023-09-03T13:25:00",
  },
  {
    id: "u_07",
    name: "Ava Williams",
    email: "ava.williams@email.com",
    company: "Wayne Enterprises",
    plan: "Pro",
    status: "Pending",
    lastLogin: "2023-09-01T08:50:00",
  },
  {
    id: "u_08",
    name: "Noah Brown",
    email: "noah.brown@email.com",
    company: "Umbrella Corp",
    plan: "Starter",
    status: "Failed",
    lastLogin: "2023-09-02T15:30:00",
  },
  {
    id: "u_09",
    name: "Emma Jones",
    email: "emma.jones@email.com",
    company: "Cyberdyne Systems",
    plan: "Ultra",
    status: "Paid",
    lastLogin: "2023-09-03T10:40:00",
  },
  {
    id: "u_10",
    name: "Liam Miller",
    email: "liam.miller@email.com",
    company: "Oscorp",
    plan: "Pro",
    status: "Paid",
    lastLogin: "2023-09-01T12:15:00",
  },
];

export function UsersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "";
    }
  };

  const getPlanColor = (plan: User["plan"]) => {
    switch (plan) {
      case "Starter":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "Pro":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "Ultra":
        return "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Metrics</CardTitle>
          <CardDescription>
            Summary of user statistics and distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <p className="text-3xl font-bold">2,350</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Plan Distribution
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPlanColor("Starter")}>
                  Starter: 35%
                </Badge>
                <Badge variant="outline" className={getPlanColor("Pro")}>
                  Pro: 45%
                </Badge>
                <Badge variant="outline" className={getPlanColor("Ultra")}>
                  Ultra: 20%
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Payment Status
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor("Paid")}>
                  Paid: 78%
                </Badge>
                <Badge variant="outline" className={getStatusColor("Pending")}>
                  Pending: 15%
                </Badge>
                <Badge variant="outline" className={getStatusColor("Failed")}>
                  Failed: 7%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>User</DropdownMenuItem>
                  <DropdownMenuItem>Company</DropdownMenuItem>
                  <DropdownMenuItem>Plan</DropdownMenuItem>
                  <DropdownMenuItem>Status</DropdownMenuItem>
                  <DropdownMenuItem>Last Login</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback>
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPlanColor(user.plan)}>
                      {user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(user.status)}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit user</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
              {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}