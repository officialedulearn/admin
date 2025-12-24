"use client";

import { useState, useEffect } from "react";
import { Users, Search, Loader2, Crown, Shield, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService, type AdminUser } from "@/services/admin.service";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Users</h1>
          <p className="text-muted-foreground">Manage platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-[#00FF80]" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Premium Users</p>
              <p className="text-2xl font-bold">{users.filter((u) => u.isPremium).length}</p>
            </div>
            <Crown className="w-8 h-8 text-[#F59E0B]" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Verified Users</p>
              <p className="text-2xl font-bold">{users.filter((u) => u.verified).length}</p>
            </div>
            <Shield className="w-8 h-8 text-[#3B82F6]" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">With Push Token</p>
              <p className="text-2xl font-bold">{users.filter((u) => u.expoPushToken).length}</p>
            </div>
            <Mail className="w-8 h-8 text-[#8B5CF6]" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>XP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00FF80]/20 flex items-center justify-center">
                      <span className="text-[#00FF80] font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <span className="capitalize px-2 py-1 rounded-full text-xs bg-secondary">
                    {user.level}
                  </span>
                </TableCell>
                <TableCell className="text-[#00FF80] font-medium">{user.xp.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.isPremium && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#F59E0B]/20 text-[#F59E0B]">
                        Premium
                      </span>
                    )}
                    {user.verified && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#3B82F6]/20 text-[#3B82F6]">
                        Verified
                      </span>
                    )}
                    {!user.isPremium && !user.verified && (
                      <span className="text-muted-foreground text-xs">Standard</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.lastLoggedIn).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}


