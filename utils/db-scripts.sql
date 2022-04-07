DROP SCHEMA IF EXISTS std_management_app;
create database std_management_app;

use std_management_app;

drop table if exists TaiKhoan;
create table TaiKhoan(
                         MaTaiKhoan bigint primary key,
                         TenDangNhap text,
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
    TaiKhoan    bigint
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
    ChuNhiemLop bigint null,
    TaiKhoan    bigint null
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
                           MaPHHS bigint,
                           MaHocSinh bigint,
                           QuanHe text not null,
                           primary key (MaPHHS, MaHocSinh)
);


drop table if exists ThanhTich;
create table ThanhTich(
                          MaThanhTich bigint primary key,
                          TenHoatDong text,
                          NgayDienRa datetime
);

drop table if exists CTThanhTich;
create table CTThanhTich(
                            MaThanhTich bigint,
                            MaHocSinh bigint,
                            SoLanThamGia integer,
                            primary key (MaThanhTich, MaHocSinh)
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
    MaHocPhi bigint ,
    MaGV bigint,
    MonHoc bigint,
    primary key (MaHocPhi,MaGV,MonHoc)
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
    MaLop   bigint ,
    MaLichThi bigint,
    primary key(MaLichThi, MaLop)
);


drop table if exists CTLTKB;
create table CTLTKB
(
    MaLop   bigint,
    MaMon bigint,
    ThoiGianBD time,
    NgayHoc date,
    primary key (MaLop,MaMon)
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
    MaMon   bigint,
    MaLichThi   bigint,
    NgayThi date null,
    ThoiGianBD time null,
    ThoiGianKt time null,
    PhongThi  text null,
    primary key (MaMon,MaLichThi)
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
    MaHocSinh   bigint auto_increment,
    MaMon   bigint,
    HocKy   bigint,
    NamHoc   bigint,
    TenMonHoc text null,
    HeSoDiem float null,
    SoDiem float null,
    primary key (MaHocSinh, MaMon, HocKy, NamHoc)
);
