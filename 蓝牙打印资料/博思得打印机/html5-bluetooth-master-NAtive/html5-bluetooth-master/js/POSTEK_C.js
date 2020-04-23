var IOException=-1002;//io流异常
var ParameterError=-1005;
  
  
function PTK_ClearBuffer() {

        var nReturn = 0;
       var data = "N\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetPrintSpeed(px) {
        var nReturn = 0;

       var data = "S" + px + "\r\n";
        if((px < 0 || px > 10) && (px % 5 != 0 || px / 5 < 2 || px / 5 > 8) && (px % 10 != 0 || px / 10 < 4 || px / 10 > 10)) {
            nReturn = -1005;
            return nReturn;
        } else {
            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_SetDirection() {
        var nReturn = 0;
       
       var data = "Z" + direct + "\r\n";
        if(!direct.equals("B") && !direct.equals("T")) {
            nReturn = ParameterError;
            return nReturn;
        } else {

            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_SetDarkness(id) {
        var nReturn = 0;
        var pid;
        if(id >= 0 && id <= 20) {
            pid = id;
        } else {
            pid = 10;
        }
       var data = "H" + pid + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetLabelHeight(lHeight, gapH, gapOffset, bFlag) {
        var nReturn = 0;
       var gap=0;
       var data = "";
        if(lHeight >= 1 && lHeight <= 65535 && gapH >= 0 && gapH <= 240) {
            if(bFlag) {
                if(gapOffset >= 0) {
                    gap =  gapH + "+" + gapOffset;
                } else {
                    gap = gapH + gapOffset;
                }

                data = "Q" + lHeight + ",B" + gap + "\r\n";
            } else {
                data = "Q" + lHeight + "," + gapH + "\r\n";
            }
        }
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetLabelWidth(lWidth) {
        var nReturn = 0;
       var data = "q" + lWidth + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetCoordinateOrigin(px, py) {
        var nReturn = 0;
       var data = "R" + px + "," + py + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_PrintLabel(number, cpnumber) {
        var nReturn = 0;
       var data = "";
        if(number >= 1 && number <= 65535) {
            if(cpnumber >= 1 && cpnumber <= 65535) {
                data = "W" + number + "," + cpnumber + "\r\n";
            } else {
                data = "W" + number + "," + 1 + "\r\n";
            }
            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_PrintLabelAuto(number, cpnumber) {
        var nReturn = 0;
       var data = "";
        if(number >= 1 && number <= 65535) {
            if(cpnumber >= 1 && cpnumber <= 65535) {
                data = "WA" + number + "," + cpnumber + "\r\n";
            } else {
                data = "WA" + number + "," + 1 + "\r\n";
            }

            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_SoftFontList() {
        var nReturn = 0;
       var data = "EI\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SoftFontDel(id) {
        var nReturn = 0;
        if((id < 'A' || id > 'Z') && id != '*') {
            nReturn =ParameterError;
            return nReturn;
        } else {
           var data = "EK\"" + id + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_EnableBackFeed() {
        var nReturn = 0;
       var data = "JF\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DisableBackFeed() {
        var nReturn = 0;
       var data = "JB\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_PrintConfiguration() {
        var nReturn = 0;
       var data = "U\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetPrinterState(state) {
        var nReturn = 0;
       var data = "O" + state + "\r\n";
        if(state != 'P'&& state != 'L' && state != 'D' && state != 'C' && state != 'N') {
            nReturn = ParameterError;
            return nReturn;
        } else {
            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_EnableErrorReport() {
        var nReturn = 0;
       var data = "US\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DisableErrorReport() {
        var nReturn = 0;
       var data = "UN\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_EnableFLASH() {
        var nReturn = 0;
       var data = "ZS\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DisableFLASH() {
        var nReturn = 0;
       var data = "ZN\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_FeedMedia() {
        var nReturn = 0;
       var data = "FM\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_MediaDetect() {
        var nReturn = 0;
       var data = "MD\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_Reset() {
        var nReturn = 0;
       var data = "^@\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_CutPage(page) {
        var nReturn = 0;
        var cp = page;
        if(page > 999 || page < 1) {
            cp = 1;
        }
       var data = "CT" + cp + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }


function PTK_FeedBack() {
        var nReturn = 0;
       var data = "^ee\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_UserBackFeed(feedLen) {
        var nReturn = 0;
       var data = "JH" + feedLen + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetNetworkFeedbackParameter(port, var ip, cp) {
        var nReturn = 0;
       var data = "NF" + port + "," + ip + "," + cp + "\r\n";
        if(cp != 0 && cp != 1) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_SetFeedbackPort(port) {
        var nReturn = 0;
       var data = "FB" + port + "\r\n";
          nReturn=sendData(data);
            return nReturn;
    }

 // 检测的各种方法：
 	function Ccheck1(id) {
 		var rec = id;
 		if (rec >= 0 && rec <= 9) {
 			return true;
 		} else {
 			return false;
 		}
 	}

 	function Ccheck2(maxNum) {
 		var max = maxNum;
 		if (max > 0 && max < 40) {
 			return true;
 		} else {
 			return false;
 		}
 	}

 	function Ccheck3(text) {
 		var txt = text;
 		if (txt == 'L' || txt == 'C' || txt == 'R' || txt == 'N') {
 			return true;
 		} else {
 			return false;
 		}
 	}

 	function AcheckA3(direct) {
 		var nReturn = 0;
 		if (direct == 0 || direct == 1 || direct == 2 || direct == 3) {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

 	function  AcheckA4(Afont) {
 		var font = Afont;
 		if (font >= '1' && font <= '7') {
 			return font - 48;
 		} else if ((font >= 'A' && font <= 'Z') || font == 'a') {
 			return font;
 		} else {
 			return -1;
 		}
 	}

 	function  AcheckA56(Horizontal,Vertical) {
 		var h, v;
 		var nReturn = 0;
 		h = Horizontal;
 		v = Vertical;
 		if ((h >= 1 && h <= 999) && (v >= 1 && v <= 999)) {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

 	function  AcheckA7(text) {
 		var nReturn = 0;
 		var txt = text;
 		if (txt == 'N' || txt == 'R') {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

 	function  AcheckBarcode7(text) {
 		var nReturn = 0;
 		var txt = text;
 		if (txt == 'N' || txt == 'B') {
 			return nReturn;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第5个参数是否正确。
 	function  Bar2d_check_S(s) {
 		if (s >= 0 && s <= 8) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第6个参数是否正确。
 	function  Bar2d_check_C(c) {
 		if (c == 0 || c == 1) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第7个参数是否正确。
 	function  Bar2d_check_PX(px) {
 		if (px >= 0 && px <= 8) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第8个参数是否正确。
 	function  Bar2d_check_PY(py) {
 		if (py >= 4 && py <= 99) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第11个参数是否正确。
 	function  Bar2d_check_T(t) {
 		if (t == 0 || t == 1) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第12个参数是否正确。
 	function  Bar2d_check_O(o) {
 		if (o == 0 || o == 1 || o == 2 || o == 3) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

 	// 检测Bar2D_Pdf417函数第13个参数是否正确。
 	function  Bar2d_check_PSTR(pstr) {
 		if (pstr != null) {
 			return 1;
 		} else {
 			return -1;
 		}
 	}

    
function PTK_DrawText(px, py, pdirec, pFont, pHorizontal, pVertical,  ptext, pstr) {
        var nReturn = 0;
       var data = "";
        pstr=pstr.replaceAll("\"", "\\\\\"");
        if(this.AcheckA3(pdirec) >= 0 && this.AcheckA4(pFont) >= 0 && this.AcheckA56(pHorizontal, pVertical) >= 0 && this.AcheckA7(ptext) >= 0) {
            data = "T" + px + "," + py + "," + pdirec + "," + pFont + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";

            nReturn=sendData(data);

            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }
   
function PTK_DrawBarcode(px, py, pdirec,pCode, NarrowWidth, pHorizontal, pVertical,  ptext,  pstr) {
        var nReturn = 0;
       var data = "";
        if(this.AcheckA3(pdirec) >= 0 && this.AcheckBarcode7(ptext) >= 0) {
            data = "B" + px + "," + py + "," + pdirec + "," + pCode + "," + NarrowWidth + "," + pHorizontal + "," + pVertical + "," + ptext + ",\"" + pstr + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

 
function PTK_DrawBar2D_QR(x, y, w, v, o, r, m, g, s, pstr) {
        var nReturn = 0;
       var data = "";
        if(o >= 0 && o <= 3 && r >= 1 && r <= 999 && m >= 0 && m <= 4 && g >= 0 && g <= 3 && s >= 0 && s <= 8) {
            data = "b" + x + "," + y + ",QR," + w + "," + v + ",o" + o + ",r" + r + ",m" + m + ",g" + g + ",s" + s + ",\"" + pstr + "\"\r\n";
           nReturn=sendDataQR(data);

            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_DrawBar2D_DATAMATRIX(x, y, w, v, o, m, pstr) {
        var nReturn = 0;
       var data = "";
        if(o >= 0 && o <= 3 && m >= 1 && m <= 9) {
            data = "b" + x + "," + y + ",DX," + w + "," + v + ",o" + o + ",m" + m + ",\"" + pstr + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_DrawBar2D_MaxiCode(x, y, m, u, pstr) {
        var nReturn = 0;
       var data = "";
        if(u >= 0 && u <= 1 && m >= 2 && m <= 4) {
            data ="b" + x + "," + y + ",M," + m + "," + u + ",\"" + pstr + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_DrawBar2D_Pdf417(x, y, w, v, s, c, px, py, r, l, t, o, pstr) {
        var nReturn = 0;
       var data = "";
        if(this.Bar2d_check_C(c) > 0 && this.Bar2d_check_O(o) > 0 && this.Bar2d_check_PX(px) > 0 && this.Bar2d_check_PY(py) > 0 && this.Bar2d_check_S(s) > 0 && this.Bar2d_check_T(t) > 0 && this.Bar2d_check_PSTR(pstr) > 0) {
            data ="b" + x + "," + y + ",P," + w + "," + v + ",s" + s + ",c" + c + ",x" + px + ",y" + py + ",r" + r + ",l" + l + ",t" + t + ",o" + o + ",\"" + pstr + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_DrawBar2D_HANXIN(x, y, w, v, m, o, r, g, s, pstr) {
        var nReturn = 0;
       var data = "";
        if(o >= 0 && o <= 3 && m >= 0 && m <= 6 && r >= 0 && r <= 30 && g >= 0 && g <= 3 && s >= 0 && s <= 3) {
            data ="b" + x + "," + y + ",HX," + w + "," + v + ",m" + m + ",o" + o + ",r" + r + ",g" + g + ",s" + s + ",\"" + pstr + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_DrawRectangle(px, py, thickness, pEx, pEy) {
        var nReturn = 0;
       var data = "X" + px + "," + py + "," + thickness + "," + pEx + "," + pEy + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DrawLineXor(px, py, pbyte, pH) {
        var nReturn = 0;
       var data = "LE" + px + "," + py + "," + pbyte + "," + pH + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DrawLineOr(px, py, plength, pH) {
        var nReturn = 0;
       var data = "LO" + px + "," + py + "," + plength + "," + pH + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DrawDiagonal(px, py, thickness, pEx, pEy) {
        var nReturn = 0;
       var data = "LS" + px + "," + py + "," + thickness + "," + pEx + "," + pEy + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DrawWhiteLine(px, py, plength, pH) {
        var nReturn = 0;
       var data = "LW" + px + "," + py + "," + plength + "," + pH + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_PcxGraphicsList() {
        var nReturn = 0;
       var data = "GI\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_PcxGraphicsDel(pid) {
        var nReturn = 0;
       var data = "";
        if((pid.length() <= 0 || pid.length() > 16)) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            data ="GK\"" + pid + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        }
    }

function PTK_PcxGraphicsDownload(pcxname,pcxfile) {
        var nReturn = 0;
        var fileSize = pcxfile.length;
       var data = "";
        var LC="\r\n";
        if(pcxname.length() > 0 && pcxname.length() <= 16) {
            data ="GM\"" + pcxname + "\"" + fileSize + "\r\n";
            nReturn=sendData(data);
            nReturn=sendData(LC);
            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_DrawPcxGraphics(px, py,  gname) {
        var nReturn = 0;
       var data = "";
        if(gname.length() > 0 && gname.length() <= 16) {
            data ="GG" + px + "," + py + ",\"" + gname + "\"\r\n";
            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_PrintPCX(px, py, pcxname,pcxfile) {
        var nReturn=0;
        nReturn = this.PTK_PcxGraphicsDel(pcxname);
        if(nReturn < 0) {
            return nReturn;
        } else {
            nReturn = this.PTK_PcxGraphicsDownload(pcxname, pcxfile);
            if(nReturn < 0) {
                return nReturn;
            } else {
                nReturn = this.PTK_DrawPcxGraphics(px, py, pcxname);
                return nReturn < 0?nReturn:nReturn;
            }
        }
    }



function PTK_BinGraphicsList() {
        var nReturn = 0;
       var data = "BI\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_BinGraphicsDel(pid) {
        var nReturn = 0;
       var data = "";
        if(pid.length() <= 0 || pid.length() > 16) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            data ="BK\"" + pid + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        }
    }

function PTK_BinGraphicsDownloadbin(Name, pbyte, pH, Gdata) {
        var nReturn = 0;
       var data = "GD\"" + binName + "\"" + pbyte + "," + pH + ","+Gdata+"\r\n";
      nReturn=sendData(data);

        return nReturn;
    }

function PTK_RecallBinGraphics(px, py, binName) {
        var nReturn = 0;
       var data = "";
        if(binName.length() > 0 && binName.length() <= 16) {
            data ="GC" + px + "," + py + ",\"" + binName + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        } else {
            nReturn =ParameterError;
            return nReturn;
        }
    }

function PTK_DrawBinGraphics(px, py, pbyte, pH, Gdata) {
        var nReturn = 0;
       var data = "GW" + px + "," + py + "," + pbyte + "," + pH + ",";
        
        return nReturn;
    }

function PTK_FormList() {
        var nReturn = 0;
       var data = "FI\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_FormDel(pid) {
        var nReturn = 0;
       var data = "";
        if(pid.length() <= 0 || pid.length() > 16) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            data ="FK\"" + pid + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        }
    }

function PTK_FormDownload(pid) {
        var nReturn = 0;
       var data = "";
        if(pid.length() <= 0 || pid.length() > 16) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            data ="FS\"" + pid + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        }
    }

function PTK_FormEnd() {
        var nReturn = 0;
       var data = "FE\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_ExecForm(pid) {
        var nReturn = 0;
       var data = "";
        if(pid.length() <= 0 || pid.length() > 16) {
            nReturn = ParameterError;
            return nReturn;
        } else {
            data ="FR\"" + pid + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        }
    }

function PTK_DefineCounter(id, maxNum, ptext, pstr, pMsg) {
        var nReturn = 0;
       var data = "";
        if(this.Ccheck1(id) && this.Ccheck2(maxNum) && this.Ccheck3(ptext)) {
            data ="C" + id + "," + maxNum + "," + ptext + "," + pstr + ",\"" + pMsg + "\"\r\n";
            nReturn=sendData(data);

            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_DefineVariable(pid, pmax,  porder,  pMsg) {
        var nReturn = 0;
       var data = "";
        if(pid <= 99 && pmax >= 1 && pmax <= 99 && this.Ccheck3(porder)) {
            data ="V" + pid + "," + pmax + "," + porder + ",\"" + pMsg + "\"\r\n";

            nReturn=sendData(data);
            return nReturn;
        } else {
            nReturn = ParameterError;
            return nReturn;
        }
    }

function PTK_Download() {
        var nReturn = 0;
       var data = "?\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_DownloadInitVar(pstr) {
        var nReturn = 0;
       var data = pstr + "\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_SetFontGap(gap) {
        var nReturn = 0;
        if(gap >= 100) {
            gap = 99;
        }

        if(gap < -99) {
            gap = -99;
        }

       var data = "g" + gap + "\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_SetCharSets(BitValue,  CharSets,  CountryCode) {
        var nReturn = 0;
       var data = "I" + BitValue + "," + CharSets + "," + CountryCode + "\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_RenameDownloadFont(StoreType,  Fontname,  DownloadFontName) {
        var nReturn = 0;
       var data = "CF" + StoreType + "," + Fontname + "," + DownloadFontName + "\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_RFIDCalibration() {
        var nReturn = 0;
       var data = "MR\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_RWRFIDLabel(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea,  pstr) {
        var nReturn = 0;
       var data = "RF" + nRWMode + "," + nWForm + "," + nStartBlock + "," + nWDataNum + "," + nWArea + ",\"" + pstr + "\"\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

function PTK_SetRFLabelPWAndLockRFLabel(nOperationMode, OperationnArea,  pstr) {
        var nReturn = 0;
       var data = "RZ" + nOperationMode + "," + OperationnArea + ",\"" + pstr + "\"\r\n";
        nReturn=sendData(data);
        return nReturn;
    }

function PTK_SetRFID(nReservationParameters, nReadWriteLocation, ReadWriteArea, nMaxErrNum, nErrProcessingMethod) {
        var nReturn = 0;
       var data = "RS" + nReservationParameters + "," + nReadWriteLocation + "," + ReadWriteArea + "," + nMaxErrNum + "," + nErrProcessingMethod + "\r\n";
        nReturn=sendData(data);

        return nReturn;
    }

    //此函数不会被clearbuffer函数清空  避免出现被清空而漏写芯片
function PTK_RWRFIDLabelEx(nRWMode, nWForm, nStartBlock, nWDataNum, nWArea, pstr) {
        var nReturn = 0;
       var data = "RA" + nRWMode + "," + nWForm + "," + nStartBlock + "," + nWDataNum + "," + nWArea + "," + pstr + "\r\n";
        nReturn=sendData(data);
        return nReturn;
    }
   
   function PTK_ReadRFIdTagData(dataBlock, ReadPower, feed) {
	   var nReturn=0;
        var  data="RR"+dataBlock+","+feedBackPort+","+ReadPower+","+feed;
      nReturn=sendData(data);
	  return nReturn;
    }



		    
    function PTK_GetTrueTypeList() {
		var  nReturn=0;
       var data ="^S1\r\n";
	   nReturn=sendData(data);
        return nReturn;
    }



  function PTK_Print300DpiDemo() {
        var nReturn = 0;
       
       var  data = "I8,1,001\r\nQ886,24\r\nq1228\r\nH10\r\nZB\r\nR0,0\r\nN\r\nLO6,223,1216,12\r\nLO6,468,1216,12\r\nB46,258,0,0,3,9,137,N,\"42045458\"\r\nB170,551,0,0,6,18,258,N,\"00006141411234567890\"\r\nT43,16,0,3,1,1,N,\"FROM\"\r\nT169,52,0,3,1,1,N,\"BIG SUPPLY\"\r\nT172,95,0,3,1,1,N,\"SAVENUE\"\r\nT170,136,0,3,1,1,N,\"NEWYORK\"\r\nT177,178,0,3,1,1,N,\"USA\"\r\nT684,176,0,3,1,1,N,\"USA\"\r\nT683,136,0,3,1,1,N,\"DAYTON.OHIO\"\r\nT680,99,0,3,1,1,N,\"8163NEWCAJUN\"\r\nT687,56,0,3,1,1,N,\"GOEATVALUE\"\r\nT612,16,0,3,1,1,N,\"TO\"\r\nT734,404,0,3,1,1,N,\"PRO2895769\"\r\nT727,335,0,3,1,1,N,\"B/L853930\"\r\nT729,264,0,3,1,1,N,\"SHIP TO POST\"\r\nT554,490,0,1,2,2,N,\"0 0614141 123456789\"\r\nT197,93,0,3,1,1,N,\"th\"\r\nT178,407,0,1,2,2,N,\"(420)45458\"\r\nT179,821,0,1,3,3,N,\"(00)006141411234567890\"\r\nW1,1\r\n";
        nReturn=sendData(data);
        return nReturn;
    }