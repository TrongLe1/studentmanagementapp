import {engine} from 'express-handlebars'
import express_section from 'express-handlebars-sections'
import numeral from 'numeral';

export default function (app) {
    app.engine('hbs', engine({
        helpers: {
            section: express_section(),
            format_date(val) {
                const date = val.getDate()
                const month = val.getMonth() + 1
                return [
                    date.toString().padStart(2, '0'),
                    month.toString().padStart(2, '0'),
                    val.getFullYear()
                ].join('/')
            },
            format_gender(val) {
                if (val === 1) return 'Nam'
                else return 'Nữ'
            },
            formatDate(val) {
                return new Intl.DateTimeFormat('vi-VN').format(new Date(val))
            },
            checkGender(val) {
                if (val === 0) {
                    return "Nam"
                } else
                    return "Nữ"
            },
            formatMoney(val) {
                return val.toLocaleString({style: 'currency', currency: 'VNĐ'}) + " VNĐ";
            },
            format_price(val) {
                return numeral(val).format('0, 0');
            },
            checkTimeSession(val) {
                let s = val.split(':')[0]
                return s < 13 ? "Sáng" : "Chiều"
            },
            timeTableCheck(val) {
                // console.log(val)
                let result = ""
                let ngay = 2;
                let idx = 0;
                while (ngay <= 8) {
                    if (val[idx] != null && ngay === val[idx].NgayHoc) {
                        result += '<td>\n'
                        result += '<span class="bg-sky padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom    font-size16 xs-font-size13">'
                        result += val[idx].TenMonHoc
                        result += '</span>\n'
                        // result += '<div class="font-size13 text-light-gray">'
                        // result += 'Ivana Wong'
                        // result += '</div>\n'
                        result += '</td>\n'
                        idx++
                    } else {
                        result += '<td></td>'
                    }
                    ngay += 1
                }
                return result
            },
            format_status(val) {
                if (val === 1) return "Hoạt động"
                else return "Đã khóa"
            },
            format_type(val) {
                if (val === 1) return "Giáo viên"
                else if (val === 2) return "Học sinh"
                else if (val === 3) return "Giáo viên chủ nhiệm"
                else if (val === 4) return "Giáo vụ"
            },
            formatScores: function (val) {
                // console.log(val)
                let result = ""
                let hs1 = 0;
                let hs2 = 0;
                let hs3 = 0;
                let idx = 0, times = 0, sum=0,tongheso=0;
                while(times < 7){
                    if(hs1 < 4){
                        if(val[idx].HeSoDiem === 1){
                            result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                            sum+= val[idx].SoDiem

                            idx++
                            tongheso++
                        }else{
                            result+= `<td class="text-center"></td>`
                        }
                        hs1++
                    }else if(hs2 < 2){
                        if(val[idx].HeSoDiem === 2){
                            result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                            sum+= val[idx].SoDiem * 2
                            idx++
                            tongheso+=2
                        }else{
                            result+= `<td class="text-center"></td>`
                        }
                        hs2++
                    }else{
                        if(val[idx].HeSoDiem === 3){
                            result+= `<td class="text-center">${val[idx].SoDiem}</td>`
                            sum+= val[idx].SoDiem * 3
                            idx++
                            tongheso+=3
                        }else{
                            result+= `<td class="text-center"></td>`
                        }
                        hs3++
                    }
                    // console.log(sum)
                    times++;
                }


                let value = (sum/tongheso).toFixed(2)
                if (hs1 !== 0 && hs2 !==0  && hs3 !== 0) {
                    result += `<td class="text-center">${value}</td>`
                    // Tinh Diem
                } else {
                    result += '<td class="text-center"></td>'
                }
                // console.log(val)
                return result
            },
            plusIdx(val) {
                return val++
            }
        }
    }));
    app.set('view engine', 'hbs')
    app.set('views', './views')
}
