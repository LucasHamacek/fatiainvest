"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel,
} from "@/components/ui/select"
import { SelectGroup } from "@radix-ui/react-select";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext";
import { useDebouncedCallback } from "use-debounce";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
    const { setTheme, theme } = useTheme();
    const { user, loading } = useAuth();
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mounted, setMounted] = useState(false)
    const [passwordValid, setPasswordValid] = useState(true)
    const [investorProfile, setInvestorProfile] = useState("agressivo")
    const [profileSaving, setProfileSaving] = useState(false)

    useEffect(() => {
        if (user) {
            setName(user.user_metadata?.name || "")
            setEmail(user.email || "")
            setInvestorProfile(user.user_metadata?.investorProfile || "agressivo")
        }
        setMounted(true)
    }, [user])

    // Validação de senha igual ao cadastro
    const validatePassword = (password: string) => {
        // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    useEffect(() => {
        setPasswordValid(password === "" || validatePassword(password))
    }, [password])

    const handleSave = async () => {
        setSaving(true)
        let errorMsg = ""
        let updated = false
        let passwordChanged = false
        // Valida senha se preenchida
        if (password && !validatePassword(password)) {
            toast.error("A senha deve ter pelo menos 8 caracteres, com maiúscula, minúscula e número.")
            setSaving(false)
            return
        }
        // Atualiza nome e perfil de investidor (user_metadata)
        if (name !== user?.user_metadata?.name || investorProfile !== user?.user_metadata?.investorProfile) {
            const { error: metaError } = await supabase.auth.updateUser({
                data: { name, investorProfile }
            })
            if (metaError) errorMsg = metaError.message
            else updated = true
        }
        // Atualiza email
        let emailError = null
        if (user && email !== user.email) {
            const { error } = await supabase.auth.updateUser({ email })
            if (error) emailError = error.message
            else updated = true
        }
        // Atualiza senha se preenchida
        let passError = null
        if (password) {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) passError = error.message
            else { updated = true; passwordChanged = true; setPassword("") }
        }
        setSaving(false)
        if (errorMsg || emailError || passError) {
            toast.error("Erro ao salvar: " + (errorMsg || emailError || passError))
        } else if (updated) {
            if (passwordChanged) toast.success("Senha alterada com sucesso!")
            else toast.success("Perfil atualizado com sucesso!")
        } else {
            toast("Nenhuma alteração detectada.")
        }
    }

    // Salva automaticamente ao trocar o perfil de investidor, agora com debounce
    const debouncedUpdateProfile = useDebouncedCallback((profile: string) => {
        if (!user) return;
        if (profile !== user?.user_metadata?.investorProfile) {
            setProfileSaving(true)
            supabase.auth.updateUser({ data: { investorProfile: profile } })
                .then(({ error }) => {
                    setProfileSaving(false)
                    if (error) toast.error("Erro ao salvar perfil de investidor: " + error.message)
                    else toast.success("Perfil de investidor atualizado!")
                });
        }
    }, 800); // 800ms debounce

    useEffect(() => {
        if (!user) return;
        debouncedUpdateProfile(investorProfile);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [investorProfile, user]);

    return (
        <div className="max-w-2xl mx-auto py-4 px-4">
            <Button variant="ghost" className="mb-2" onClick={() => window.location.href = '/home'}>
                <ArrowLeft className="mr-2 size-4" /> Voltar
            </Button>
            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Perfil</CardTitle>
                    <Separator className="mb-2" />
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                    <div>
                        <Label className="mb-2" htmlFor="name">Nome</Label>
                        <Input id="name" name="name" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} disabled={loading || saving} />
                    </div>
                    <div>
                        <Label className="mb-2" htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="Seu email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading || saving} />
                    </div>
                    <div>
                        <Label className="mb-2" htmlFor="password">Senha</Label>
                        <Input id="password" name="password" type="password" placeholder="Nova senha" value={password} onChange={e => setPassword(e.target.value)} disabled={loading || saving} className={password && !passwordValid ? "border-red-500" : ""} />
                        <p className={`text-xs mt-1 ${password ? (passwordValid ? "text-green-600" : "text-red-600") : "text-gray-500"}`}>
                            8+ caracteres, maiúscula, minúscula e número
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={loading || saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
                </CardContent>
            </Card>
            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Perfil do Investidor</CardTitle>
                    <Separator />
                </CardHeader>
                <CardContent className="px-0">
                    <Select value={investorProfile} onValueChange={setInvestorProfile} disabled={profileSaving}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione um perfil" />
                            {profileSaving && <span className="ml-2 animate-spin">⏳</span>}
                        </SelectTrigger>
                        <SelectContent >
                            <SelectGroup>
                                <SelectLabel>Perfis</SelectLabel>
                                <SelectItem value="conservador">Conservador</SelectItem>
                                <SelectItem value="agressivo">Agressivo</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter className="px-0">
                    <div className="mt-2 text-sm text-muted-foreground">
                        <div>
                            <span className="font-semibold">Conservador:</span> Usa a abordagem clássica de Décio Bazin, considerando o preço máximo com base em um rendimento de dividendos (DY) de 6%, conforme proposto por Bazin.
                        </div>
                        <div className="mt-1">
                            <span className="font-semibold">Agressivo:</span> Usa o retorno máximo que a ação pode oferecer, com base na média de DY distribuída pela empresa nos últimos 5 anos.
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Tema</CardTitle>
                    <Separator />
                </CardHeader>
                <CardContent className="px-0">
                    {mounted && (
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Temas</SelectLabel>
                                    <SelectItem value="system">Sistema</SelectItem>
                                    <SelectItem value="light">Claro</SelectItem>
                                    <SelectItem value="dark">Escuro</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
