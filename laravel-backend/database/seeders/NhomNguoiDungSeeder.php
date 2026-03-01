<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NhomNguoiDungSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            ['ten_nhom' => 'Quản trị hệ thống', 'ma_nhom' => 'admin'],
            ['ten_nhom' => 'Bác sĩ', 'ma_nhom' => 'doctors'],
            ['ten_nhom' => 'Lễ tân – Thu ngân', 'ma_nhom' => 'receptionists'],
            ['ten_nhom' => 'Quản lý', 'ma_nhom' => 'managers'],
            ['ten_nhom' => 'Bệnh nhân', 'ma_nhom' => 'patient'],
        ];

        foreach ($groups as $group) {
            DB::table('nhom_nguoi_dung')->updateOrInsert(
                ['ma_nhom' => $group['ma_nhom']],
                ['ten_nhom' => $group['ten_nhom']]
            );
        }
    }
}
