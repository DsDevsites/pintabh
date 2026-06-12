import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  listAdminUsers,
  createAdminUser,
  removeAdminRole,
  deleteUser,
  resetUserPassword,
} from "@/lib/users.functions";
import { Trash2, KeyRound, ShieldOff, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listAdminUsers);
  const createFn = useServerFn(createAdminUser);
  const removeRoleFn = useServerFn(removeAdminRole);
  const deleteFn = useServerFn(deleteUser);
  const resetFn = useServerFn(resetUserPassword);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createM = useMutation({
    mutationFn: () => createFn({ data: { email, password } }),
    onSuccess: () => {
      toast.success("Administrador criado");
      setEmail("");
      setPassword("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeM = useMutation({
    mutationFn: (userId: string) => removeRoleFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("Acesso de administrador removido");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (userId: string) => deleteFn({ data: { userId } }),
    onSuccess: () => {
      toast.success("Usuário excluído");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleReset(userId: string) {
    const newPass = window.prompt("Nova senha (mín. 6 caracteres):");
    if (!newPass || newPass.length < 6) return;
    try {
      await resetFn({ data: { userId, password: newPass } });
      toast.success("Senha redefinida");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AdminLayout title="Usuários">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-background ring-1 ring-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-4 w-4" />
            <h2 className="font-display text-lg">Novo administrador</h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createM.mutate();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              required
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              disabled={createM.isPending}
              className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {createM.isPending ? "Criando..." : "Adicionar administrador"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-background ring-1 ring-border p-6">
          <h2 className="font-display text-lg mb-4">Usuários cadastrados</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {users?.map((u) => (
                <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{u.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {u.roles.length > 0 ? u.roles.join(", ") : "sem papéis"}
                      {u.last_sign_in_at && ` · último acesso ${new Date(u.last_sign_in_at).toLocaleDateString("pt-BR")}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReset(u.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted"
                      title="Resetar senha"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Senha
                    </button>
                    {u.roles.includes("admin") && (
                      <button
                        onClick={() => {
                          if (confirm("Remover privilégio de administrador?")) removeM.mutate(u.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted"
                      >
                        <ShieldOff className="h-3.5 w-3.5" /> Remover admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) deleteM.mutate(u.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/40 text-destructive text-xs hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
              {users?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuário.</p>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}