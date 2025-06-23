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
import type { User } from "@supabase/supabase-js";

export default function SettingsPage() {
    const { setTheme, theme } = useTheme();
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mounted, setMounted] = useState(false)
    const [passwordValid, setPasswordValid] = useState(true)
    const [investorProfile, setInvestorProfile] = useState("agressivo")
    const [profileSaving, setProfileSaving] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
            setName(data.user?.user_metadata?.name || "")
            setEmail(data.user?.email || "")
            setInvestorProfile(data.user?.user_metadata?.investorProfile || "agressivo")
            setLoading(false)
        })
        setMounted(true)
    }, [])

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

    // Salva automaticamente ao trocar o perfil de investidor
    useEffect(() => {
        if (!user) return;
        if (investorProfile !== user?.user_metadata?.investorProfile) {
            setProfileSaving(true)
            supabase.auth.updateUser({ data: { investorProfile } })
                .then(({ error }) => {
                    setProfileSaving(false)
                    if (error) toast.error("Erro ao salvar perfil de investidor: " + error.message)
                    else toast.success("Perfil de investidor atualizado!")
                });
        }
    }, [investorProfile, user]);

    return (
        <div className="max-w-2xl mx-auto py-4 px-4">
            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Profile</CardTitle>
                    <Separator className="mb-2" />
                </CardHeader>
                <CardContent className="space-y-4 px-0">
                    <div>
                        <Label className="mb-2" htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} disabled={loading || saving} />
                    </div>
                    <div>
                        <Label className="mb-2" htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading || saving} />
                    </div>
                    <div>
                        <Label className="mb-2" htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading || saving} className={password && !passwordValid ? "border-red-500" : ""} />
                        <p className={`text-xs mt-1 ${password ? (passwordValid ? "text-green-600" : "text-red-600") : "text-gray-500"}`}>
                            8+ caracteres, maiúscula, minúscula e número
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={loading || saving}>{saving ? "Saving..." : "Save changes"}</Button>
                </CardContent>
            </Card>
            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Investor Profile</CardTitle>
                    <Separator />
                </CardHeader>
                <CardContent className="px-0">
                    <Select value={investorProfile} onValueChange={setInvestorProfile} disabled={profileSaving}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a profile" />
                            {profileSaving && <span className="ml-2 animate-spin">⏳</span>}
                        </SelectTrigger>
                        <SelectContent >
                            <SelectGroup>
                                <SelectLabel>Profiles</SelectLabel>
                                <SelectItem value="conservador">Conservative</SelectItem>
                                <SelectItem value="agressivo">Aggressive</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter className="px-0">
                    <div className="mt-2 text-sm text-muted-foreground">
                        <div>
                            <span className="font-semibold">Conservative:</span> Uses the classic Décio Bazin approach, considering the maximum price based on a 6% dividend yield (DY) as proposed by Bazin.
                        </div>
                        <div className="mt-1">
                            <span className="font-semibold">Aggressive:</span> Uses the maximum return the stock can offer, based on the average DY distributed by the company over the last 5 years.
                        </div>
                    </div>
                </CardFooter>
            </Card>

            <Card className="mb-6 shadow-none border-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-2xl font-normal">Theme</CardTitle>
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
                                    <SelectLabel>Themes</SelectLabel>
                                    <SelectItem value="system">System</SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
