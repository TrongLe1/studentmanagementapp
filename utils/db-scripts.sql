DROP SCHEMA IF EXISTS std_management_app;
create database std_management_app;

use std_management_app;

drop table if exists TaiKhoan;
create table TaiKhoan(
    TenDangNhap text primary key,
    Matkhau text not null,
    TrangThai boolean default 1,
    LoaiTaiKhoan integer
);

drop table if exists HocSinh;
create table HocSinh
(
    MaHocSinh   bigint primary key AUTO_INCREMENT,
    HoTen       text not null,
    GioiTinh    boolean null,
    NgaySinh    date null,
    DiaChi      text null,
    QueQuan     text null,
    SDT         text(10) null,
    DanToc      text null,
    TonGiao     text,
    ThuocLop    bigint,
    TaiKhoan    text
);

drop table if exists GiaoVien;
create table GiaoVien
(
    MaGV        bigint primary key AUTO_INCREMENT,
    HoTen       text not null,
    NgaySinh    date null,
    SDT         text(10) null,
    GioiTinh    boolean null,
    DiaChi      text null,
    ThuocLop    bigint null,
    ChuNhiemLop bigint null
);

drop table if exists PhuHuynh;
create table PhuHuynh
(
    MaPHHS      bigint primary key AUTO_INCREMENT,
    HoTen       text not null,
    NgaySinh    date null,
    NgheNghiep  text null,
    ChucVu      text null,
    SDT         text(10) null
);

drop table if exists CTPhuHuynh;
create table CTPhuHuynh(
    MaPHHS bigint primary key,
    MaHocSinh bigint primary key,
    QuanHe text not null
);


drop table if exists ThanhTich;
create table ThanhTich(
    MaThanhTich bigint primary key,
    TenHoatDong text,
    NgayDienRa datetime
);

drop table if exists CTThanhTich;
create table CTThanhTich(
    MaThanhTich bigint primary key,
    MaHocSinh bigint primary key,
    SoLanThamGia integer
);

drop table if exists ViPham;
create table ViPham(
    MaThanhTich bigint primary key,
    DiemTru float
);

drop table if exists KhenThuong;
create table KhenThuong(
    MaThanhTich bigint primary key,
    DiemCong float
);

drop table if exists LopHoc;
create table LopHoc
(
    MaLop       bigint primary key AUTO_INCREMENT,
    TenLop      text not null,
    PhongHoc    text null,
    SoDoLop     blob null,
    NamHoc      text null
);

drop table if exists HocPhi;
create table HocPhi
(
    MaHocPhi       bigint primary key AUTO_INCREMENT,
    TenHocPhi      text not null,
    HocKy    text null,
    NamHoc      text null,
    TongTien float,
    MaLop bigint
);

drop table if exists CTGiangDay;
create table CTGiangDay
(
    MaHocPhi bigint primary key,
    MaGV bigint primary key,
    MonHoc bigint primary key
);

drop table if exists ThoiKhoaBieu;
create table ThoiKhoaBieu
(
    MaLop   bigint primary key,
    HocKy   text null,
    NamHoc  text null
);

drop table if exists CTLTLH;
create table CTLTLH
(
    MaLop   bigint primary key,
    MaLichThi bigint primary key
);


drop table if exists CTLTKB;
create table CTLTKB
(
    MaLop   bigint primary key,
    MaMon bigint primary key,
    ThoiGianBD time,
    NgayHoc date
);

drop table if exists LichThi;
create table LichThi
(
    MaLop   bigint primary key,
    HocKy   text null,
    NamHoc  text null
);

drop table if exists CTLTMH;
create table CTLTMH
(
    MaMon   bigint primary key,
    MaLichThi   bigint primary key,
    NgayThi date null,
    ThoiGianBD time null,
    ThoiGianKt time null,
    PhongThi  text null
);

drop table if exists MonHoc;
create table MonHoc
(
    MaMon   bigint primary key auto_increment,
    TenMonHoc text null
);


drop table if exists Diem;
create table Diem
(
    MaHocSinh   bigint primary key auto_increment,
    MaMon   bigint primary key ,
    HocKy   bigint primary key ,
    NamHoc   bigint primary key ,
    TenMonHoc text null,
    HeSoDiem float null,
    SoDiem float null
);
