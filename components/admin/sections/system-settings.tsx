"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Settings, Database, Bell, Shield, Clock } from "lucide-react"

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Настройки системы
          </CardTitle>
          <CardDescription>Конфигурация и параметры системы учета</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Рабочее время
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="workStart">Начало рабочего дня</Label>
              <Input id="workStart" type="time" defaultValue="08:00" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workEnd">Окончание рабочего дня</Label>
              <Input id="workEnd" type="time" defaultValue="17:00" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lateThreshold">Порог опоздания (минут)</Label>
            <Input id="lateThreshold" type="number" defaultValue="15" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email уведомления</Label>
              <p className="text-sm text-slate-500">Отправка уведомлений на почту сотрудников</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Уведомления об опозданиях</Label>
              <p className="text-sm text-slate-500">Автоматические уведомления руководителям</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Напоминания о заявках</Label>
              <p className="text-sm text-slate-500">Напоминания о необработанных заявках</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Двухфакторная аутентификация</Label>
              <p className="text-sm text-slate-500">Дополнительная защита учетных записей</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Автоматический выход</Label>
              <p className="text-sm text-slate-500">Выход из системы при неактивности</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
            <Input id="sessionTimeout" type="number" defaultValue="60" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5" />
            База данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Автоматическое резервное копирование</Label>
              <p className="text-sm text-slate-500">Ежедневное создание резервных копий</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="backupTime">Время резервного копирования</Label>
            <Input id="backupTime" type="time" defaultValue="02:00" />
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Создать резервную копию сейчас
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Отменить</Button>
        <Button>Сохранить настройки</Button>
      </div>
    </div>
  )
}
