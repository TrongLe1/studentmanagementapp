DROP SCHEMA IF EXISTS std_management_app;
create database std_management_app;

use std_management_app;

drop table if exists TaiKhoan;
create table TaiKhoan
(
    MaTaiKhoan   bigint primary key auto_increment,
    TenDangNhap  text,
    Matkhau      text not null,
    TrangThai    boolean default 1,
    LoaiTaiKhoan integer
);

drop table if exists PhuHuynh;
create table PhuHuynh
(
    MaPHHS     bigint primary key AUTO_INCREMENT,
    HoTen      text     not null,
    NgaySinh   date     null,
    NgheNghiep text     null,
    ChucVu     text     null,
    SDT        text(10) null
);


drop table if exists ThanhTich;
create table ThanhTich
(
    MaThanhTich bigint primary key auto_increment,
    TenHoatDong text,
    NgayDienRa  datetime
);

drop table if exists LopHoc;
create table LopHoc
(
    MaLop    bigint primary key AUTO_INCREMENT,
    TenLop   text not null,
    PhongHoc text null,
    SoDoLop  blob null,
    NamHoc   text null
);

drop table if exists LichThi;
create table LichThi
(
    MaLichThi bigint auto_increment primary key,
    HocKy  text null,
    NamHoc text null
);

drop table if exists MonHoc;
create table MonHoc
(
    MaMon     bigint primary key auto_increment,
    TenMonHoc text null
);

drop table if exists HocSinh;
create table HocSinh
(
    MaHocSinh bigint primary key AUTO_INCREMENT,
    HoTen     text     not null,
    GioiTinh  boolean  null,
    NgaySinh  date     null,
    DiaChi    text     null,
    QueQuan   text     null,
    SDT       text(10) null,
    DanToc    text     null,
    TonGiao   text,
    ThuocLop  bigint,
    TaiKhoan  bigint,
    CONSTRAINT FK_HocSinh_TaiKhoan FOREIGN KEY (TaiKhoan)
        REFERENCES TaiKhoan (MaTaiKhoan),
    CONSTRAINT FK_HocSinh_LopHoc FOREIGN KEY (ThuocLop)
        REFERENCES LopHoc (MaLop)
);

drop table if exists GiaoVien;
create table GiaoVien
(
    MaGV        bigint primary key AUTO_INCREMENT,
    HoTen       text     not null,
    NgaySinh    date     null,
    SDT         text(10) null,
    GioiTinh    boolean  null,
    DiaChi      text     null,
    ChuNhiemLop bigint   null,
    TaiKhoan    bigint   null,
    CONSTRAINT FK_GiaoVien_TaiKhoan FOREIGN KEY (TaiKhoan)
        REFERENCES TaiKhoan (MaTaiKhoan),
    CONSTRAINT FK_GiaoVien_LopHop FOREIGN KEY (ChuNhiemLop)
        REFERENCES LopHoc (MaLop)
);

drop table if exists CTPhuHuynh;
create table CTPhuHuynh
(
    MaPHHS    bigint,
    MaHocSinh bigint,
    QuanHe    text not null,
    primary key (MaPHHS, MaHocSinh),
    CONSTRAINT FK_CTPhuHuynh_HocSinh FOREIGN KEY (MaHocSinh)
        REFERENCES HocSinh (MaHocSinh),
    CONSTRAINT FK_CTPhuHuynh_PhuHuynh FOREIGN KEY (MaPHHS)
        REFERENCES PhuHuynh (MaPHHS)
);


drop table if exists CTThanhTich;
create table CTThanhTich
(
    MaThanhTich  bigint,
    MaHocSinh    bigint,
    SoLanThamGia integer,
    primary key (MaThanhTich, MaHocSinh),
    CONSTRAINT FK_CTThanhTich_HocSinh FOREIGN KEY (MaHocSinh)
        REFERENCES HocSinh (MaHocSinh),
    CONSTRAINT FK_CTPhuHuynh_ThanhTich FOREIGN KEY (MaThanhTich)
        REFERENCES ThanhTich (MaThanhTich)

);

drop table if exists ViPham;
create table ViPham
(
    MaThanhTich bigint primary key,
    DiemTru     float,
    CONSTRAINT FK_ViPham_ThanhTich FOREIGN KEY (MaThanhTich)
        REFERENCES ThanhTich (MaThanhTich)
);

drop table if exists KhenThuong;
create table KhenThuong
(
    MaThanhTich bigint primary key,
    DiemCong    float,
    CONSTRAINT FK_KhenThuong_ThanhTich FOREIGN KEY (MaThanhTich)
        REFERENCES ThanhTich (MaThanhTich)
);

drop table if exists HocPhi;
create table HocPhi
(
    MaHocPhi  bigint primary key AUTO_INCREMENT,
    TenHocPhi text not null,
    HocKy     text null,
    NamHoc    text null,
    TongTien  float,
    MaLop     bigint,
    CONSTRAINT FK_HocPhi_LopHoc FOREIGN KEY (MaLop)
        REFERENCES LopHoc (MaLop)
);

drop table if exists CTGiangDay;
create table CTGiangDay
(
    MaLop bigint,
    MaGV     bigint,
    MonHoc   bigint,
    primary key (MaLop, MaGV, MonHoc),
    CONSTRAINT FK_CTGiangDay_LopHoc FOREIGN KEY (MaLop)
        REFERENCES LopHoc (MaLop),
    CONSTRAINT FK_CTGiangDay_GiaoVien FOREIGN KEY (MaGV)
        REFERENCES GiaoVien (MaGV)
);

drop table if exists ThoiKhoaBieu;
create table ThoiKhoaBieu
(
    MaTKB  bigint primary key auto_increment,
    HocKy  text null,
    NamHoc text null,
    MaLop bigint,
    CONSTRAINT FK_ThoiKhoaBieu_LopHoc FOREIGN KEY (MaLop)
        REFERENCES LopHoc (MaLop)
);

drop table if exists CTLTLH;
create table CTLTLH
(
    MaLop     bigint,
    MaLichThi bigint,
    primary key (MaLichThi, MaLop),
    CONSTRAINT FK_CTLTLH_LichThi FOREIGN KEY (MaLichThi)
        REFERENCES LichThi (MaLichThi),
    CONSTRAINT FK_CTLTLH_LopHoc FOREIGN KEY (MaLop)
        REFERENCES LopHoc (MaLop)
);


drop table if exists CTTKB;
create table CTTKB
(
    MaTKB      bigint,
    MaMon      bigint,
    ThoiGianBD time,
    NgayHoc    varchar,
    primary key (MaTKB, MaMon, ThoiGianBD,NgayHoc),
    CONSTRAINT FK_CTTKB_ThoiKhoaBieu FOREIGN KEY (MaTKB)
        REFERENCES ThoiKhoaBieu (MaTKB),
    CONSTRAINT FK_CTTKB_MonHoc FOREIGN KEY (MaMon)
        REFERENCES MonHoc (MaMon)
);


drop table if exists CTLTMH;
create table CTLTMH
(
    MaMon      bigint,
    MaLichThi  bigint,
    NgayThi    date null,
    ThoiGianBD time null,
    ThoiGianKt time null,
    PhongThi   text null,
    primary key (MaMon, MaLichThi),
    CONSTRAINT FK_CTLTMH_LichThi FOREIGN KEY (MaLichThi)
        REFERENCES LichThi (MaLichThi),
    CONSTRAINT FK_CTLTMH_MonHoc FOREIGN KEY (MaMon)
        REFERENCES MonHoc (MaMon)
);


drop table if exists Diem;
create table Diem
(
    MaHocSinh bigint,
    MaMon     bigint,
    HocKy     bigint,
    NamHoc    bigint,
    TenMonHoc text  null,
    HeSoDiem  float null,
    SoDiem    float null,
    primary key (MaHocSinh, MaMon, HocKy, NamHoc),
    CONSTRAINT FK_Diem_MaMon FOREIGN KEY (MaMon)
        REFERENCES MonHoc (MaMon),
    CONSTRAINT FK_MaMon_HocSinh FOREIGN KEY (MaHocSinh)
        REFERENCES HocSinh (MaHocSinh)
);
