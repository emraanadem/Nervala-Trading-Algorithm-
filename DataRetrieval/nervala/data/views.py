from django.shortcuts import render
from django.http import HttpResponse
import json
import threading
from supabase import create_client, Client
url = "https://nvlbmpghemfunkpnhwee.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52bGJtcGdoZW1mdW5rcG5od2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxMTg3ODcsImV4cCI6MjAyMzY5NDc4N30.woZOGh5WaEcUtEyvsXaNP3Kg6BsNP8UOWhmv5RG4iMY"
supabase: Client = create_client(url, key)

timeperiods = ['Five_Min', 'Fifteen_Min', 'Thirty_Min', 'One_Hour', 'Two_Hour', 'Four_Hour', 'Daily', 'Weekly', 'Five_Min Extend', 'Fifteen_Min Extend', 'Thirty_Min Extend', 'One_Hour Extend', 'Two_Hour Extend', 'Four_Hour Extend', 'Daily Extend', 'Weekly Extend']



with open('instruments.json', 'r') as instr:
   instruments = json.loads(instr.read())['instruments']

datas = {}
def organizer():
   for inst in instruments:
      threading.Thread(target=assigner, args = [inst]).start()

def assigner(inst):
   datas[inst] = {}
   for period in timeperiods:
      datas[inst][period] = {}
      datas[inst][period]['c'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'c').execute().data[0]['Data']
      datas[inst][period]['h'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'h').execute().data[0]['Data']
      datas[inst][period]['l'] = supabase.table(period).select('Data').eq('Instrument', inst).eq('OHLC', 'l').execute().data[0]['Data']

def XAU_USD(request):
   instrument='XAU_USD'
   return HttpResponse(str(datas[instrument]))

def USD_NOK(request):
   instrument='USD_NOK'
   return HttpResponse(str(datas[instrument]))

def USD_CZK(request):
   instrument='USD_CZK'
   return HttpResponse(str(datas[instrument]))

def USD_DKK(request):
   instrument='USD_DKK'
   return HttpResponse(str(datas[instrument]))

def USD_HKD(request):
   instrument='USD_HKD'
   return HttpResponse(str(datas[instrument]))

def USD_SAR(request):
   instrument='USD_SAR'
   return HttpResponse(str(datas[instrument]))

def EUR_HUF(request):
   instrument='EUR_HUF'
   return HttpResponse(str(datas[instrument]))

def USD_CNH(request):
   instrument='USD_CNH'
   return HttpResponse(str(datas[instrument]))

def EUR_TRY(request):
   instrument='EUR_TRY'
   return HttpResponse(str(datas[instrument]))

def ZAR_JPY(request):
   instrument='ZAR_JPY'
   return HttpResponse(str(datas[instrument]))

def SGD_JPY(request):
   instrument='SGD_JPY'
   return HttpResponse(str(datas[instrument]))

def EUR_PLN(request):
   instrument='EUR_PLN'
   return HttpResponse(str(datas[instrument]))

def GBP_HKD(request):
   instrument='GBP_HKD'
   return HttpResponse(str(datas[instrument]))

def AUD_SGD(request):
   instrument='AUD_SGD'
   return HttpResponse(str(datas[instrument]))

def EUR_SGD(request):
   instrument='EUR_SGD'
   return HttpResponse(str(datas[instrument]))

def GBP_SGD(request):
   instrument='GBP_SGD'
   return HttpResponse(str(datas[instrument]))

def GBP_ZAR(request):
   instrument='GBP_ZAR'
   return HttpResponse(str(datas[instrument]))

def ETH_USD(request):
   instrument='ETH_USD'
   return HttpResponse(str(datas[instrument]))

def LTC_USD(request):
   instrument='LTC_USD'
   return HttpResponse(str(datas[instrument]))

def BCH_USD(request):
   instrument='BCH_USD'
   return HttpResponse(str(datas[instrument]))

def MBTC_USD(request):
   instrument='MBTC_USD'
   return HttpResponse(str(datas[instrument]))

def GBP_PLN(request):
   instrument='GBP_PLN'
   return HttpResponse(str(datas[instrument]))

def XAU_EUR(request):
   instrument='XAU_EUR'
   return HttpResponse(str(datas[instrument]))

def XAU_AUD(request):
   instrument='XAU_AUD'
   return HttpResponse(str(datas[instrument]))

def XAU_SGD(request):
   instrument='XAU_SGD'
   return HttpResponse(str(datas[instrument]))

def XAU_GBP(request):
   instrument='XAU_GBP'
   return HttpResponse(str(datas[instrument]))

def XAU_JPY(request):
   instrument='XAU_JPY'
   return HttpResponse(str(datas[instrument]))

def XAG_EUR(request):
   instrument='XAG_EUR'
   return HttpResponse(str(datas[instrument]))

def XAU_CHF(request):
   instrument='XAU_CHF'
   return HttpResponse(str(datas[instrument]))

def XAG_AUD(request):
   instrument='XAG_AUD'
   return HttpResponse(str(datas[instrument]))

def XAU_CAD(request):
   instrument='XAU_CAD'
   return HttpResponse(str(datas[instrument]))

def XAG_GBP(request):
   instrument='XAG_GBP'
   return HttpResponse(str(datas[instrument]))

def XAU_NZD(request):
   instrument='XAU_NZD'
   return HttpResponse(str(datas[instrument]))

def XAG_CAD(request):
   instrument='XAG_CAD'
   return HttpResponse(str(datas[instrument]))

def XAG_CHF(request):
   instrument='XAG_CHF'
   return HttpResponse(str(datas[instrument]))

def XAG_SGD(request):
   instrument='XAG_SGD'
   return HttpResponse(str(datas[instrument]))

def XAG_JPY(request):
   instrument='XAG_JPY'
   return HttpResponse(str(datas[instrument]))

def XAG_NZD(request):
   instrument='XAG_NZD'
   return HttpResponse(str(datas[instrument]))

def XAU_HKD(request):
   instrument='XAU_HKD'
   return HttpResponse(str(datas[instrument]))

def XAG_HKD(request):
   instrument='XAG_HKD'
   return HttpResponse(str(datas[instrument]))

def TRY_JPY(request):
   instrument='TRY_JPY'
   return HttpResponse(str(datas[instrument]))

def SGD_CHF(request):
   instrument='SGD_CHF'
   return HttpResponse(str(datas[instrument]))

def SGD_HKD(request):
   instrument='SGD_HKD'
   return HttpResponse(str(datas[instrument]))

def HKD_JPY(request):
   instrument='HKD_JPY'
   return HttpResponse(str(datas[instrument]))

def CAD_HKD(request):
   instrument='CAD_HKD'
   return HttpResponse(str(datas[instrument]))

def CAD_SGD(request):
   instrument='CAD_SGD'
   return HttpResponse(str(datas[instrument]))

def CHF_ZAR(request):
   instrument='CHF_ZAR'
   return HttpResponse(str(datas[instrument]))

def CHF_HKD(request):
   instrument='CHF_HKD'
   return HttpResponse(str(datas[instrument]))

def NZD_HKD(request):
   instrument='NZD_HKD'
   return HttpResponse(str(datas[instrument]))

def EUR_USD(request):
   instrument='EUR_USD'
   return HttpResponse(str(datas[instrument]))

def NAS100_USD(request):
   instrument='NAS100_USD'
   return HttpResponse(str(datas[instrument]))

def GBP_JPY(request):
   instrument='GBP_JPY'
   return HttpResponse(str(datas[instrument]))

def US30_USD(request):
   instrument='US30_USD'
   return HttpResponse(str(datas[instrument]))

def GBP_USD(request):
   instrument='GBP_USD'
   return HttpResponse(str(datas[instrument]))

def SPX500_USD(request):
   instrument='SPX500_USD'
   return HttpResponse(str(datas[instrument]))

def USD_JPY(request):
   instrument='USD_JPY'
   return HttpResponse(str(datas[instrument]))

def AUD_USD(request):
   instrument='AUD_USD'
   return HttpResponse(str(datas[instrument]))

def USD_CAD(request):
   instrument='USD_CAD'
   return HttpResponse(str(datas[instrument]))

def EUR_JPY(request):
   instrument='EUR_JPY'
   return HttpResponse(str(datas[instrument]))

def AUD_JPY(request):
   instrument='AUD_JPY'
   return HttpResponse(str(datas[instrument]))

def NZD_USD(request):
   instrument='NZD_USD'
   return HttpResponse(str(datas[instrument]))

def XAG_USD(request):
   instrument='XAG_USD'
   return HttpResponse(str(datas[instrument]))

def GBP_AUD(request):
   instrument='GBP_AUD'
   return HttpResponse(str(datas[instrument]))

def USD_CHF(request):
   instrument='USD_CHF'
   return HttpResponse(str(datas[instrument]))

def EUR_GBP(request):
   instrument='EUR_GBP'
   return HttpResponse(str(datas[instrument]))

def EUR_AUD(request):
   instrument='EUR_AUD'
   return HttpResponse(str(datas[instrument]))

def CAD_JPY(request):
   instrument='CAD_JPY'
   return HttpResponse(str(datas[instrument]))

def EUR_CAD(request):
   instrument='EUR_CAD'
   return HttpResponse(str(datas[instrument]))

def AUD_CAD(request):
   instrument='AUD_CAD'
   return HttpResponse(str(datas[instrument]))

def GBP_CAD(request):
   instrument='GBP_CAD'
   return HttpResponse(str(datas[instrument]))

def NZD_JPY(request):
   instrument='NZD_JPY'
   return HttpResponse(str(datas[instrument]))

def EUR_NZD(request):
   instrument='EUR_NZD'
   return HttpResponse(str(datas[instrument]))

def DE30_EUR(request):
   instrument='DE30_EUR'
   return HttpResponse(str(datas[instrument]))

def USD_THB(request):
   instrument='USD_THB'
   return HttpResponse(str(datas[instrument]))

def AUD_CHF(request):
   instrument='AUD_CHF'
   return HttpResponse(str(datas[instrument]))

def EUR_CHF(request):
   instrument='EUR_CHF'
   return HttpResponse(str(datas[instrument]))

def GBP_CHF(request):
   instrument='GBP_CHF'
   return HttpResponse(str(datas[instrument]))

def NZD_CAD(request):
   instrument='NZD_CAD'
   return HttpResponse(str(datas[instrument]))

def AUD_NZD(request):
   instrument='AUD_NZD'
   return HttpResponse(str(datas[instrument]))

def USD_TRY(request):
   instrument='USD_TRY'
   return HttpResponse(str(datas[instrument]))

def CHF_JPY(request):
   instrument='CHF_JPY'
   return HttpResponse(str(datas[instrument]))

def CAD_CHF(request):
   instrument='CAD_CHF'
   return HttpResponse(str(datas[instrument]))

def XPT_USD(request):
   instrument='XPT_USD'
   return HttpResponse(str(datas[instrument]))

def GBP_NZD(request):
   instrument='GBP_NZD'
   return HttpResponse(str(datas[instrument]))

def BCO_USD(request):
   instrument='BCO_USD'
   return HttpResponse(str(datas[instrument]))

def WTICO_USD(request):
   instrument='WTICO_USD'
   return HttpResponse(str(datas[instrument]))

def XPD_USD(request):
   instrument='XPD_USD'
   return HttpResponse(str(datas[instrument]))

def NZD_CHF(request):
   instrument='NZD_CHF'
   return HttpResponse(str(datas[instrument]))

def USD_INR(request):
   instrument='USD_INR'
   return HttpResponse(str(datas[instrument]))

def BTC_USD(request):
   instrument='BTC_USD'
   return HttpResponse(str(datas[instrument]))

def USD_SGD(request):
   instrument='USD_SGD'
   return HttpResponse(str(datas[instrument]))

def USD_ZAR(request):
   instrument='USD_ZAR'
   return HttpResponse(str(datas[instrument]))

def USD_SEK(request):
   instrument='USD_SEK'
   return HttpResponse(str(datas[instrument]))

def USD_MXN(request):
   instrument='USD_MXN'
   return HttpResponse(str(datas[instrument]))

def USD_PLN(request):
   instrument='USD_PLN'
   return HttpResponse(str(datas[instrument]))

def USD_HUF(request):
   instrument='USD_HUF'
   return HttpResponse(str(datas[instrument]))

def MMM(request):
   instrument='MMM'
   return HttpResponse(str(datas[instrument]))

def AOS(request):
   instrument='AOS'
   return HttpResponse(str(datas[instrument]))

def ABT(request):
   instrument='ABT'
   return HttpResponse(str(datas[instrument]))

def ABBV(request):
   instrument='ABBV'
   return HttpResponse(str(datas[instrument]))

def ABMD(request):
   instrument='ABMD'
   return HttpResponse(str(datas[instrument]))

def ACN(request):
   instrument='ACN'
   return HttpResponse(str(datas[instrument]))

def ATVI(request):
   instrument='ATVI'
   return HttpResponse(str(datas[instrument]))

def ADM(request):
   instrument='ADM'
   return HttpResponse(str(datas[instrument]))

def ADBE(request):
   instrument='ADBE'
   return HttpResponse(str(datas[instrument]))

def AAP(request):
   instrument='AAP'
   return HttpResponse(str(datas[instrument]))

def AMD(request):
   instrument='AMD'
   return HttpResponse(str(datas[instrument]))

def AES(request):
   instrument='AES'
   return HttpResponse(str(datas[instrument]))

def AFL(request):
   instrument='AFL'
   return HttpResponse(str(datas[instrument]))

def A(request):
   instrument='A'
   return HttpResponse(str(datas[instrument]))

def APD(request):
   instrument='APD'
   return HttpResponse(str(datas[instrument]))

def AKAM(request):
   instrument='AKAM'
   return HttpResponse(str(datas[instrument]))

def ALK(request):
   instrument='ALK'
   return HttpResponse(str(datas[instrument]))

def ALB(request):
   instrument='ALB'
   return HttpResponse(str(datas[instrument]))

def ARE(request):
   instrument='ARE'
   return HttpResponse(str(datas[instrument]))

def ALGN(request):
   instrument='ALGN'
   return HttpResponse(str(datas[instrument]))

def ALLE(request):
   instrument='ALLE'
   return HttpResponse(str(datas[instrument]))

def LNT(request):
   instrument='LNT'
   return HttpResponse(str(datas[instrument]))

def ALL(request):
   instrument='ALL'
   return HttpResponse(str(datas[instrument]))

def GOOGL(request):
   instrument='GOOGL'
   return HttpResponse(str(datas[instrument]))

def GOOG(request):
   instrument='GOOG'
   return HttpResponse(str(datas[instrument]))

def MO(request):
   instrument='MO'
   return HttpResponse(str(datas[instrument]))

def AMZN(request):
   instrument='AMZN'
   return HttpResponse(str(datas[instrument]))

def AMCR(request):
   instrument='AMCR'
   return HttpResponse(str(datas[instrument]))

def AEE(request):
   instrument='AEE'
   return HttpResponse(str(datas[instrument]))

def AAL(request):
   instrument='AAL'
   return HttpResponse(str(datas[instrument]))

def AEP(request):
   instrument='AEP'
   return HttpResponse(str(datas[instrument]))

def AXP(request):
   instrument='AXP'
   return HttpResponse(str(datas[instrument]))

def AIG(request):
   instrument='AIG'
   return HttpResponse(str(datas[instrument]))

def AMT(request):
   instrument='AMT'
   return HttpResponse(str(datas[instrument]))

def AWK(request):
   instrument='AWK'
   return HttpResponse(str(datas[instrument]))

def AMP(request):
   instrument='AMP'
   return HttpResponse(str(datas[instrument]))

def ABC(request):
   instrument='ABC'
   return HttpResponse(str(datas[instrument]))

def AME(request):
   instrument='AME'
   return HttpResponse(str(datas[instrument]))

def AMGN(request):
   instrument='AMGN'
   return HttpResponse(str(datas[instrument]))

def APH(request):
   instrument='APH'
   return HttpResponse(str(datas[instrument]))

def ADI(request):
   instrument='ADI'
   return HttpResponse(str(datas[instrument]))

def ANSS(request):
   instrument='ANSS'
   return HttpResponse(str(datas[instrument]))

def ANTM(request):
   instrument='ANTM'
   return HttpResponse(str(datas[instrument]))

def AON(request):
   instrument='AON'
   return HttpResponse(str(datas[instrument]))

def APA(request):
   instrument='APA'
   return HttpResponse(str(datas[instrument]))

def AAPL(request):
   instrument='AAPL'
   return HttpResponse(str(datas[instrument]))

def AMAT(request):
   instrument='AMAT'
   return HttpResponse(str(datas[instrument]))

def APTV(request):
   instrument='APTV'
   return HttpResponse(str(datas[instrument]))

def ANET(request):
   instrument='ANET'
   return HttpResponse(str(datas[instrument]))

def AJG(request):
   instrument='AJG'
   return HttpResponse(str(datas[instrument]))

def AIZ(request):
   instrument='AIZ'
   return HttpResponse(str(datas[instrument]))

def T(request):
   instrument='T'
   return HttpResponse(str(datas[instrument]))

def ATO(request):
   instrument='ATO'
   return HttpResponse(str(datas[instrument]))

def ADSK(request):
   instrument='ADSK'
   return HttpResponse(str(datas[instrument]))

def ADP(request):
   instrument='ADP'
   return HttpResponse(str(datas[instrument]))

def AZO(request):
   instrument='AZO'
   return HttpResponse(str(datas[instrument]))

def AVB(request):
   instrument='AVB'
   return HttpResponse(str(datas[instrument]))

def AVY(request):
   instrument='AVY'
   return HttpResponse(str(datas[instrument]))

def BKR(request):
   instrument='BKR'
   return HttpResponse(str(datas[instrument]))

def BLL(request):
   instrument='BLL'
   return HttpResponse(str(datas[instrument]))

def BAC(request):
   instrument='BAC'
   return HttpResponse(str(datas[instrument]))

def BBWI(request):
   instrument='BBWI'
   return HttpResponse(str(datas[instrument]))

def BAX(request):
   instrument='BAX'
   return HttpResponse(str(datas[instrument]))

def BDX(request):
   instrument='BDX'
   return HttpResponse(str(datas[instrument]))

def BBY(request):
   instrument='BBY'
   return HttpResponse(str(datas[instrument]))

def BIO(request):
   instrument='BIO'
   return HttpResponse(str(datas[instrument]))

def TECH(request):
   instrument='TECH'
   return HttpResponse(str(datas[instrument]))

def BIIB(request):
   instrument='BIIB'
   return HttpResponse(str(datas[instrument]))

def BLK(request):
   instrument='BLK'
   return HttpResponse(str(datas[instrument]))

def BK(request):
   instrument='BK'
   return HttpResponse(str(datas[instrument]))

def BA(request):
   instrument='BA'
   return HttpResponse(str(datas[instrument]))

def BKNG(request):
   instrument='BKNG'
   return HttpResponse(str(datas[instrument]))

def BWA(request):
   instrument='BWA'
   return HttpResponse(str(datas[instrument]))

def BXP(request):
   instrument='BXP'
   return HttpResponse(str(datas[instrument]))

def BSX(request):
   instrument='BSX'
   return HttpResponse(str(datas[instrument]))

def BMY(request):
   instrument='BMY'
   return HttpResponse(str(datas[instrument]))

def AVGO(request):
   instrument='AVGO'
   return HttpResponse(str(datas[instrument]))

def BR(request):
   instrument='BR'
   return HttpResponse(str(datas[instrument]))

def BRO(request):
   instrument='BRO'
   return HttpResponse(str(datas[instrument]))

def CHRW(request):
   instrument='CHRW'
   return HttpResponse(str(datas[instrument]))

def CDNS(request):
   instrument='CDNS'
   return HttpResponse(str(datas[instrument]))

def CZR(request):
   instrument='CZR'
   return HttpResponse(str(datas[instrument]))

def CPB(request):
   instrument='CPB'
   return HttpResponse(str(datas[instrument]))

def COF(request):
   instrument='COF'
   return HttpResponse(str(datas[instrument]))

def CAH(request):
   instrument='CAH'
   return HttpResponse(str(datas[instrument]))

def KMX(request):
   instrument='KMX'
   return HttpResponse(str(datas[instrument]))

def CCL(request):
   instrument='CCL'
   return HttpResponse(str(datas[instrument]))

def CARR(request):
   instrument='CARR'
   return HttpResponse(str(datas[instrument]))

def CTLT(request):
   instrument='CTLT'
   return HttpResponse(str(datas[instrument]))

def CAT(request):
   instrument='CAT'
   return HttpResponse(str(datas[instrument]))

def CBOE(request):
   instrument='CBOE'
   return HttpResponse(str(datas[instrument]))

def CBRE(request):
   instrument='CBRE'
   return HttpResponse(str(datas[instrument]))

def CDW(request):
   instrument='CDW'
   return HttpResponse(str(datas[instrument]))

def CE(request):
   instrument='CE'
   return HttpResponse(str(datas[instrument]))

def CNC(request):
   instrument='CNC'
   return HttpResponse(str(datas[instrument]))

def CNP(request):
   instrument='CNP'
   return HttpResponse(str(datas[instrument]))

def CDAY(request):
   instrument='CDAY'
   return HttpResponse(str(datas[instrument]))

def CERN(request):
   instrument='CERN'
   return HttpResponse(str(datas[instrument]))

def CF(request):
   instrument='CF'
   return HttpResponse(str(datas[instrument]))

def CRL(request):
   instrument='CRL'
   return HttpResponse(str(datas[instrument]))

def SCHW(request):
   instrument='SCHW'
   return HttpResponse(str(datas[instrument]))

def CHTR(request):
   instrument='CHTR'
   return HttpResponse(str(datas[instrument]))

def CVX(request):
   instrument='CVX'
   return HttpResponse(str(datas[instrument]))

def CMG(request):
   instrument='CMG'
   return HttpResponse(str(datas[instrument]))

def CB(request):
   instrument='CB'
   return HttpResponse(str(datas[instrument]))

def CHD(request):
   instrument='CHD'
   return HttpResponse(str(datas[instrument]))

def CI(request):
   instrument='CI'
   return HttpResponse(str(datas[instrument]))

def CINF(request):
   instrument='CINF'
   return HttpResponse(str(datas[instrument]))

def CTAS(request):
   instrument='CTAS'
   return HttpResponse(str(datas[instrument]))

def CSCO(request):
   instrument='CSCO'
   return HttpResponse(str(datas[instrument]))

def C(request):
   instrument='C'
   return HttpResponse(str(datas[instrument]))

def CFG(request):
   instrument='CFG'
   return HttpResponse(str(datas[instrument]))

def CTXS(request):
   instrument='CTXS'
   return HttpResponse(str(datas[instrument]))

def CLX(request):
   instrument='CLX'
   return HttpResponse(str(datas[instrument]))

def CME(request):
   instrument='CME'
   return HttpResponse(str(datas[instrument]))

def CMS(request):
   instrument='CMS'
   return HttpResponse(str(datas[instrument]))

def KO(request):
   instrument='KO'
   return HttpResponse(str(datas[instrument]))

def CTSH(request):
   instrument='CTSH'
   return HttpResponse(str(datas[instrument]))

def CL(request):
   instrument='CL'
   return HttpResponse(str(datas[instrument]))

def CMCSA(request):
   instrument='CMCSA'
   return HttpResponse(str(datas[instrument]))

def CMA(request):
   instrument='CMA'
   return HttpResponse(str(datas[instrument]))

def CAG(request):
   instrument='CAG'
   return HttpResponse(str(datas[instrument]))

def COP(request):
   instrument='COP'
   return HttpResponse(str(datas[instrument]))

def ED(request):
   instrument='ED'
   return HttpResponse(str(datas[instrument]))

def STZ(request):
   instrument='STZ'
   return HttpResponse(str(datas[instrument]))

def CPRT(request):
   instrument='CPRT'
   return HttpResponse(str(datas[instrument]))

def GLW(request):
   instrument='GLW'
   return HttpResponse(str(datas[instrument]))

def CTVA(request):
   instrument='CTVA'
   return HttpResponse(str(datas[instrument]))

def COST(request):
   instrument='COST'
   return HttpResponse(str(datas[instrument]))

def CTRA(request):
   instrument='CTRA'
   return HttpResponse(str(datas[instrument]))

def CCI(request):
   instrument='CCI'
   return HttpResponse(str(datas[instrument]))

def CSX(request):
   instrument='CSX'
   return HttpResponse(str(datas[instrument]))

def CMI(request):
   instrument='CMI'
   return HttpResponse(str(datas[instrument]))

def CVS(request):
   instrument='CVS'
   return HttpResponse(str(datas[instrument]))

def DHI(request):
   instrument='DHI'
   return HttpResponse(str(datas[instrument]))

def DHR(request):
   instrument='DHR'
   return HttpResponse(str(datas[instrument]))

def DRI(request):
   instrument='DRI'
   return HttpResponse(str(datas[instrument]))

def DVA(request):
   instrument='DVA'
   return HttpResponse(str(datas[instrument]))

def DE(request):
   instrument='DE'
   return HttpResponse(str(datas[instrument]))

def DAL(request):
   instrument='DAL'
   return HttpResponse(str(datas[instrument]))

def XRAY(request):
   instrument='XRAY'
   return HttpResponse(str(datas[instrument]))

def DVN(request):
   instrument='DVN'
   return HttpResponse(str(datas[instrument]))

def DXCM(request):
   instrument='DXCM'
   return HttpResponse(str(datas[instrument]))

def FANG(request):
   instrument='FANG'
   return HttpResponse(str(datas[instrument]))

def DLR(request):
   instrument='DLR'
   return HttpResponse(str(datas[instrument]))

def DFS(request):
   instrument='DFS'
   return HttpResponse(str(datas[instrument]))

def DISCA(request):
   instrument='DISCA'
   return HttpResponse(str(datas[instrument]))

def DISCK(request):
   instrument='DISCK'
   return HttpResponse(str(datas[instrument]))

def DISH(request):
   instrument='DISH'
   return HttpResponse(str(datas[instrument]))

def DG(request):
   instrument='DG'
   return HttpResponse(str(datas[instrument]))

def DLTR(request):
   instrument='DLTR'
   return HttpResponse(str(datas[instrument]))

def D(request):
   instrument='D'
   return HttpResponse(str(datas[instrument]))

def DPZ(request):
   instrument='DPZ'
   return HttpResponse(str(datas[instrument]))

def DOV(request):
   instrument='DOV'
   return HttpResponse(str(datas[instrument]))

def DOW(request):
   instrument='DOW'
   return HttpResponse(str(datas[instrument]))

def DTE(request):
   instrument='DTE'
   return HttpResponse(str(datas[instrument]))

def DUK(request):
   instrument='DUK'
   return HttpResponse(str(datas[instrument]))

def DRE(request):
   instrument='DRE'
   return HttpResponse(str(datas[instrument]))

def DD(request):
   instrument='DD'
   return HttpResponse(str(datas[instrument]))

def DXC(request):
   instrument='DXC'
   return HttpResponse(str(datas[instrument]))

def EMN(request):
   instrument='EMN'
   return HttpResponse(str(datas[instrument]))

def ETN(request):
   instrument='ETN'
   return HttpResponse(str(datas[instrument]))

def EBAY(request):
   instrument='EBAY'
   return HttpResponse(str(datas[instrument]))

def ECL(request):
   instrument='ECL'
   return HttpResponse(str(datas[instrument]))

def EIX(request):
   instrument='EIX'
   return HttpResponse(str(datas[instrument]))

def EW(request):
   instrument='EW'
   return HttpResponse(str(datas[instrument]))

def EA(request):
   instrument='EA'
   return HttpResponse(str(datas[instrument]))

def LLY(request):
   instrument='LLY'
   return HttpResponse(str(datas[instrument]))

def EMR(request):
   instrument='EMR'
   return HttpResponse(str(datas[instrument]))

def ENPH(request):
   instrument='ENPH'
   return HttpResponse(str(datas[instrument]))

def ETR(request):
   instrument='ETR'
   return HttpResponse(str(datas[instrument]))

def EOG(request):
   instrument='EOG'
   return HttpResponse(str(datas[instrument]))

def EFX(request):
   instrument='EFX'
   return HttpResponse(str(datas[instrument]))

def EQIX(request):
   instrument='EQIX'
   return HttpResponse(str(datas[instrument]))

def EQR(request):
   instrument='EQR'
   return HttpResponse(str(datas[instrument]))

def ESS(request):
   instrument='ESS'
   return HttpResponse(str(datas[instrument]))

def EL(request):
   instrument='EL'
   return HttpResponse(str(datas[instrument]))

def ETSY(request):
   instrument='ETSY'
   return HttpResponse(str(datas[instrument]))

def RE(request):
   instrument='RE'
   return HttpResponse(str(datas[instrument]))

def EVRG(request):
   instrument='EVRG'
   return HttpResponse(str(datas[instrument]))

def ES(request):
   instrument='ES'
   return HttpResponse(str(datas[instrument]))

def EXC(request):
   instrument='EXC'
   return HttpResponse(str(datas[instrument]))

def EXPE(request):
   instrument='EXPE'
   return HttpResponse(str(datas[instrument]))

def EXPD(request):
   instrument='EXPD'
   return HttpResponse(str(datas[instrument]))

def EXR(request):
   instrument='EXR'
   return HttpResponse(str(datas[instrument]))

def XOM(request):
   instrument='XOM'
   return HttpResponse(str(datas[instrument]))

def FFIV(request):
   instrument='FFIV'
   return HttpResponse(str(datas[instrument]))

def FB(request):
   instrument='FB'
   return HttpResponse(str(datas[instrument]))

def FAST(request):
   instrument='FAST'
   return HttpResponse(str(datas[instrument]))

def FRT(request):
   instrument='FRT'
   return HttpResponse(str(datas[instrument]))

def FDX(request):
   instrument='FDX'
   return HttpResponse(str(datas[instrument]))

def FIS(request):
   instrument='FIS'
   return HttpResponse(str(datas[instrument]))

def FITB(request):
   instrument='FITB'
   return HttpResponse(str(datas[instrument]))

def FRC(request):
   instrument='FRC'
   return HttpResponse(str(datas[instrument]))

def FE(request):
   instrument='FE'
   return HttpResponse(str(datas[instrument]))

def FISV(request):
   instrument='FISV'
   return HttpResponse(str(datas[instrument]))

def FLT(request):
   instrument='FLT'
   return HttpResponse(str(datas[instrument]))

def FMC(request):
   instrument='FMC'
   return HttpResponse(str(datas[instrument]))

def F(request):
   instrument='F'
   return HttpResponse(str(datas[instrument]))

def FTNT(request):
   instrument='FTNT'
   return HttpResponse(str(datas[instrument]))

def FTV(request):
   instrument='FTV'
   return HttpResponse(str(datas[instrument]))

def FBHS(request):
   instrument='FBHS'
   return HttpResponse(str(datas[instrument]))

def FOXA(request):
   instrument='FOXA'
   return HttpResponse(str(datas[instrument]))

def FOX(request):
   instrument='FOX'
   return HttpResponse(str(datas[instrument]))

def BEN(request):
   instrument='BEN'
   return HttpResponse(str(datas[instrument]))

def FCX(request):
   instrument='FCX'
   return HttpResponse(str(datas[instrument]))

def GPS(request):
   instrument='GPS'
   return HttpResponse(str(datas[instrument]))

def GRMN(request):
   instrument='GRMN'
   return HttpResponse(str(datas[instrument]))

def IT(request):
   instrument='IT'
   return HttpResponse(str(datas[instrument]))

def GNRC(request):
   instrument='GNRC'
   return HttpResponse(str(datas[instrument]))

def GD(request):
   instrument='GD'
   return HttpResponse(str(datas[instrument]))

def GE(request):
   instrument='GE'
   return HttpResponse(str(datas[instrument]))

def GIS(request):
   instrument='GIS'
   return HttpResponse(str(datas[instrument]))

def GM(request):
   instrument='GM'
   return HttpResponse(str(datas[instrument]))

def GPC(request):
   instrument='GPC'
   return HttpResponse(str(datas[instrument]))

def GILD(request):
   instrument='GILD'
   return HttpResponse(str(datas[instrument]))

def GPN(request):
   instrument='GPN'
   return HttpResponse(str(datas[instrument]))

def GL(request):
   instrument='GL'
   return HttpResponse(str(datas[instrument]))

def GS(request):
   instrument='GS'
   return HttpResponse(str(datas[instrument]))

def HAL(request):
   instrument='HAL'
   return HttpResponse(str(datas[instrument]))

def HBI(request):
   instrument='HBI'
   return HttpResponse(str(datas[instrument]))

def HAS(request):
   instrument='HAS'
   return HttpResponse(str(datas[instrument]))

def HCA(request):
   instrument='HCA'
   return HttpResponse(str(datas[instrument]))

def PEAK(request):
   instrument='PEAK'
   return HttpResponse(str(datas[instrument]))

def HSIC(request):
   instrument='HSIC'
   return HttpResponse(str(datas[instrument]))

def HES(request):
   instrument='HES'
   return HttpResponse(str(datas[instrument]))

def HPE(request):
   instrument='HPE'
   return HttpResponse(str(datas[instrument]))

def HLT(request):
   instrument='HLT'
   return HttpResponse(str(datas[instrument]))

def HOLX(request):
   instrument='HOLX'
   return HttpResponse(str(datas[instrument]))

def HD(request):
   instrument='HD'
   return HttpResponse(str(datas[instrument]))

def HON(request):
   instrument='HON'
   return HttpResponse(str(datas[instrument]))

def HRL(request):
   instrument='HRL'
   return HttpResponse(str(datas[instrument]))

def HST(request):
   instrument='HST'
   return HttpResponse(str(datas[instrument]))

def HWM(request):
   instrument='HWM'
   return HttpResponse(str(datas[instrument]))

def HPQ(request):
   instrument='HPQ'
   return HttpResponse(str(datas[instrument]))

def HUM(request):
   instrument='HUM'
   return HttpResponse(str(datas[instrument]))

def HBAN(request):
   instrument='HBAN'
   return HttpResponse(str(datas[instrument]))

def HII(request):
   instrument='HII'
   return HttpResponse(str(datas[instrument]))

def IBM(request):
   instrument='IBM'
   return HttpResponse(str(datas[instrument]))

def IEX(request):
   instrument='IEX'
   return HttpResponse(str(datas[instrument]))

def IDXX(request):
   instrument='IDXX'
   return HttpResponse(str(datas[instrument]))

def INFO(request):
   instrument='INFO'
   return HttpResponse(str(datas[instrument]))

def ITW(request):
   instrument='ITW'
   return HttpResponse(str(datas[instrument]))

def ILMN(request):
   instrument='ILMN'
   return HttpResponse(str(datas[instrument]))

def INCY(request):
   instrument='INCY'
   return HttpResponse(str(datas[instrument]))

def IR(request):
   instrument='IR'
   return HttpResponse(str(datas[instrument]))

def INTC(request):
   instrument='INTC'
   return HttpResponse(str(datas[instrument]))

def ICE(request):
   instrument='ICE'
   return HttpResponse(str(datas[instrument]))

def IFF(request):
   instrument='IFF'
   return HttpResponse(str(datas[instrument]))

def IP(request):
   instrument='IP'
   return HttpResponse(str(datas[instrument]))

def IPG(request):
   instrument='IPG'
   return HttpResponse(str(datas[instrument]))

def INTU(request):
   instrument='INTU'
   return HttpResponse(str(datas[instrument]))

def ISRG(request):
   instrument='ISRG'
   return HttpResponse(str(datas[instrument]))

def IVZ(request):
   instrument='IVZ'
   return HttpResponse(str(datas[instrument]))

def IPGP(request):
   instrument='IPGP'
   return HttpResponse(str(datas[instrument]))

def IQV(request):
   instrument='IQV'
   return HttpResponse(str(datas[instrument]))

def IRM(request):
   instrument='IRM'
   return HttpResponse(str(datas[instrument]))

def JBHT(request):
   instrument='JBHT'
   return HttpResponse(str(datas[instrument]))

def JKHY(request):
   instrument='JKHY'
   return HttpResponse(str(datas[instrument]))

def J(request):
   instrument='J'
   return HttpResponse(str(datas[instrument]))

def SJM(request):
   instrument='SJM'
   return HttpResponse(str(datas[instrument]))

def JNJ(request):
   instrument='JNJ'
   return HttpResponse(str(datas[instrument]))

def JCI(request):
   instrument='JCI'
   return HttpResponse(str(datas[instrument]))

def JPM(request):
   instrument='JPM'
   return HttpResponse(str(datas[instrument]))

def JNPR(request):
   instrument='JNPR'
   return HttpResponse(str(datas[instrument]))

def KSU(request):
   instrument='KSU'
   return HttpResponse(str(datas[instrument]))

def K(request):
   instrument='K'
   return HttpResponse(str(datas[instrument]))

def KEY(request):
   instrument='KEY'
   return HttpResponse(str(datas[instrument]))

def KEYS(request):
   instrument='KEYS'
   return HttpResponse(str(datas[instrument]))

def KMB(request):
   instrument='KMB'
   return HttpResponse(str(datas[instrument]))

def KIM(request):
   instrument='KIM'
   return HttpResponse(str(datas[instrument]))

def KMI(request):
   instrument='KMI'
   return HttpResponse(str(datas[instrument]))

def KLAC(request):
   instrument='KLAC'
   return HttpResponse(str(datas[instrument]))

def KHC(request):
   instrument='KHC'
   return HttpResponse(str(datas[instrument]))

def KR(request):
   instrument='KR'
   return HttpResponse(str(datas[instrument]))

def LHX(request):
   instrument='LHX'
   return HttpResponse(str(datas[instrument]))

def LH(request):
   instrument='LH'
   return HttpResponse(str(datas[instrument]))

def LRCX(request):
   instrument='LRCX'
   return HttpResponse(str(datas[instrument]))

def LW(request):
   instrument='LW'
   return HttpResponse(str(datas[instrument]))

def LVS(request):
   instrument='LVS'
   return HttpResponse(str(datas[instrument]))

def LEG(request):
   instrument='LEG'
   return HttpResponse(str(datas[instrument]))

def LDOS(request):
   instrument='LDOS'
   return HttpResponse(str(datas[instrument]))

def LEN(request):
   instrument='LEN'
   return HttpResponse(str(datas[instrument]))

def LNC(request):
   instrument='LNC'
   return HttpResponse(str(datas[instrument]))

def LIN(request):
   instrument='LIN'
   return HttpResponse(str(datas[instrument]))

def LYV(request):
   instrument='LYV'
   return HttpResponse(str(datas[instrument]))

def LKQ(request):
   instrument='LKQ'
   return HttpResponse(str(datas[instrument]))

def LMT(request):
   instrument='LMT'
   return HttpResponse(str(datas[instrument]))

def L(request):
   instrument='L'
   return HttpResponse(str(datas[instrument]))

def LOW(request):
   instrument='LOW'
   return HttpResponse(str(datas[instrument]))

def LUMN(request):
   instrument='LUMN'
   return HttpResponse(str(datas[instrument]))

def LYB(request):
   instrument='LYB'
   return HttpResponse(str(datas[instrument]))

def MTB(request):
   instrument='MTB'
   return HttpResponse(str(datas[instrument]))

def MRO(request):
   instrument='MRO'
   return HttpResponse(str(datas[instrument]))

def MPC(request):
   instrument='MPC'
   return HttpResponse(str(datas[instrument]))

def MKTX(request):
   instrument='MKTX'
   return HttpResponse(str(datas[instrument]))

def MAR(request):
   instrument='MAR'
   return HttpResponse(str(datas[instrument]))

def MMC(request):
   instrument='MMC'
   return HttpResponse(str(datas[instrument]))

def MLM(request):
   instrument='MLM'
   return HttpResponse(str(datas[instrument]))

def MAS(request):
   instrument='MAS'
   return HttpResponse(str(datas[instrument]))

def MA(request):
   instrument='MA'
   return HttpResponse(str(datas[instrument]))

def MTCH(request):
   instrument='MTCH'
   return HttpResponse(str(datas[instrument]))

def MKC(request):
   instrument='MKC'
   return HttpResponse(str(datas[instrument]))

def MCD(request):
   instrument='MCD'
   return HttpResponse(str(datas[instrument]))

def MCK(request):
   instrument='MCK'
   return HttpResponse(str(datas[instrument]))

def MDT(request):
   instrument='MDT'
   return HttpResponse(str(datas[instrument]))

def MRK(request):
   instrument='MRK'
   return HttpResponse(str(datas[instrument]))

def MET(request):
   instrument='MET'
   return HttpResponse(str(datas[instrument]))

def MTD(request):
   instrument='MTD'
   return HttpResponse(str(datas[instrument]))

def MGM(request):
   instrument='MGM'
   return HttpResponse(str(datas[instrument]))

def MCHP(request):
   instrument='MCHP'
   return HttpResponse(str(datas[instrument]))

def MU(request):
   instrument='MU'
   return HttpResponse(str(datas[instrument]))

def MSFT(request):
   instrument='MSFT'
   return HttpResponse(str(datas[instrument]))

def MAA(request):
   instrument='MAA'
   return HttpResponse(str(datas[instrument]))

def MRNA(request):
   instrument='MRNA'
   return HttpResponse(str(datas[instrument]))

def MHK(request):
   instrument='MHK'
   return HttpResponse(str(datas[instrument]))

def TAP(request):
   instrument='TAP'
   return HttpResponse(str(datas[instrument]))

def MDLZ(request):
   instrument='MDLZ'
   return HttpResponse(str(datas[instrument]))

def MPWR(request):
   instrument='MPWR'
   return HttpResponse(str(datas[instrument]))

def MNST(request):
   instrument='MNST'
   return HttpResponse(str(datas[instrument]))

def MCO(request):
   instrument='MCO'
   return HttpResponse(str(datas[instrument]))

def MS(request):
   instrument='MS'
   return HttpResponse(str(datas[instrument]))

def MSI(request):
   instrument='MSI'
   return HttpResponse(str(datas[instrument]))

def MSCI(request):
   instrument='MSCI'
   return HttpResponse(str(datas[instrument]))

def NDAQ(request):
   instrument='NDAQ'
   return HttpResponse(str(datas[instrument]))

def NTAP(request):
   instrument='NTAP'
   return HttpResponse(str(datas[instrument]))

def NFLX(request):
   instrument='NFLX'
   return HttpResponse(str(datas[instrument]))

def NWL(request):
   instrument='NWL'
   return HttpResponse(str(datas[instrument]))

def NEM(request):
   instrument='NEM'
   return HttpResponse(str(datas[instrument]))

def NWSA(request):
   instrument='NWSA'
   return HttpResponse(str(datas[instrument]))

def NWS(request):
   instrument='NWS'
   return HttpResponse(str(datas[instrument]))

def NEE(request):
   instrument='NEE'
   return HttpResponse(str(datas[instrument]))

def NLSN(request):
   instrument='NLSN'
   return HttpResponse(str(datas[instrument]))

def NKE(request):
   instrument='NKE'
   return HttpResponse(str(datas[instrument]))

def NI(request):
   instrument='NI'
   return HttpResponse(str(datas[instrument]))

def NSC(request):
   instrument='NSC'
   return HttpResponse(str(datas[instrument]))

def NTRS(request):
   instrument='NTRS'
   return HttpResponse(str(datas[instrument]))

def NOC(request):
   instrument='NOC'
   return HttpResponse(str(datas[instrument]))

def NLOK(request):
   instrument='NLOK'
   return HttpResponse(str(datas[instrument]))

def NCLH(request):
   instrument='NCLH'
   return HttpResponse(str(datas[instrument]))

def NRG(request):
   instrument='NRG'
   return HttpResponse(str(datas[instrument]))

def NUE(request):
   instrument='NUE'
   return HttpResponse(str(datas[instrument]))

def NVDA(request):
   instrument='NVDA'
   return HttpResponse(str(datas[instrument]))

def NVR(request):
   instrument='NVR'
   return HttpResponse(str(datas[instrument]))

def NXPI(request):
   instrument='NXPI'
   return HttpResponse(str(datas[instrument]))

def ORLY(request):
   instrument='ORLY'
   return HttpResponse(str(datas[instrument]))

def OXY(request):
   instrument='OXY'
   return HttpResponse(str(datas[instrument]))

def ODFL(request):
   instrument='ODFL'
   return HttpResponse(str(datas[instrument]))

def OMC(request):
   instrument='OMC'
   return HttpResponse(str(datas[instrument]))

def OKE(request):
   instrument='OKE'
   return HttpResponse(str(datas[instrument]))

def ORCL(request):
   instrument='ORCL'
   return HttpResponse(str(datas[instrument]))

def OGN(request):
   instrument='OGN'
   return HttpResponse(str(datas[instrument]))

def OTIS(request):
   instrument='OTIS'
   return HttpResponse(str(datas[instrument]))

def PCAR(request):
   instrument='PCAR'
   return HttpResponse(str(datas[instrument]))

def PKG(request):
   instrument='PKG'
   return HttpResponse(str(datas[instrument]))

def PH(request):
   instrument='PH'
   return HttpResponse(str(datas[instrument]))

def PAYX(request):
   instrument='PAYX'
   return HttpResponse(str(datas[instrument]))

def PAYC(request):
   instrument='PAYC'
   return HttpResponse(str(datas[instrument]))

def PYPL(request):
   instrument='PYPL'
   return HttpResponse(str(datas[instrument]))

def PENN(request):
   instrument='PENN'
   return HttpResponse(str(datas[instrument]))

def PNR(request):
   instrument='PNR'
   return HttpResponse(str(datas[instrument]))

def PBCT(request):
   instrument='PBCT'
   return HttpResponse(str(datas[instrument]))

def PEP(request):
   instrument='PEP'
   return HttpResponse(str(datas[instrument]))

def PKI(request):
   instrument='PKI'
   return HttpResponse(str(datas[instrument]))

def PFE(request):
   instrument='PFE'
   return HttpResponse(str(datas[instrument]))

def PM(request):
   instrument='PM'
   return HttpResponse(str(datas[instrument]))

def PSX(request):
   instrument='PSX'
   return HttpResponse(str(datas[instrument]))

def PNW(request):
   instrument='PNW'
   return HttpResponse(str(datas[instrument]))

def PXD(request):
   instrument='PXD'
   return HttpResponse(str(datas[instrument]))

def PNC(request):
   instrument='PNC'
   return HttpResponse(str(datas[instrument]))

def POOL(request):
   instrument='POOL'
   return HttpResponse(str(datas[instrument]))

def PPG(request):
   instrument='PPG'
   return HttpResponse(str(datas[instrument]))

def PPL(request):
   instrument='PPL'
   return HttpResponse(str(datas[instrument]))

def PFG(request):
   instrument='PFG'
   return HttpResponse(str(datas[instrument]))

def PG(request):
   instrument='PG'
   return HttpResponse(str(datas[instrument]))

def PGR(request):
   instrument='PGR'
   return HttpResponse(str(datas[instrument]))

def PLD(request):
   instrument='PLD'
   return HttpResponse(str(datas[instrument]))

def PRU(request):
   instrument='PRU'
   return HttpResponse(str(datas[instrument]))

def PTC(request):
   instrument='PTC'
   return HttpResponse(str(datas[instrument]))

def PEG(request):
   instrument='PEG'
   return HttpResponse(str(datas[instrument]))

def PSA(request):
   instrument='PSA'
   return HttpResponse(str(datas[instrument]))

def PHM(request):
   instrument='PHM'
   return HttpResponse(str(datas[instrument]))

def PVH(request):
   instrument='PVH'
   return HttpResponse(str(datas[instrument]))

def QRVO(request):
   instrument='QRVO'
   return HttpResponse(str(datas[instrument]))

def QCOM(request):
   instrument='QCOM'
   return HttpResponse(str(datas[instrument]))

def PWR(request):
   instrument='PWR'
   return HttpResponse(str(datas[instrument]))

def DGX(request):
   instrument='DGX'
   return HttpResponse(str(datas[instrument]))

def RL(request):
   instrument='RL'
   return HttpResponse(str(datas[instrument]))

def RJF(request):
   instrument='RJF'
   return HttpResponse(str(datas[instrument]))

def RTX(request):
   instrument='RTX'
   return HttpResponse(str(datas[instrument]))

def O(request):
   instrument='O'
   return HttpResponse(str(datas[instrument]))

def REG(request):
   instrument='REG'
   return HttpResponse(str(datas[instrument]))

def REGN(request):
   instrument='REGN'
   return HttpResponse(str(datas[instrument]))

def RF(request):
   instrument='RF'
   return HttpResponse(str(datas[instrument]))

def RSG(request):
   instrument='RSG'
   return HttpResponse(str(datas[instrument]))

def RMD(request):
   instrument='RMD'
   return HttpResponse(str(datas[instrument]))

def RHI(request):
   instrument='RHI'
   return HttpResponse(str(datas[instrument]))

def ROK(request):
   instrument='ROK'
   return HttpResponse(str(datas[instrument]))

def ROL(request):
   instrument='ROL'
   return HttpResponse(str(datas[instrument]))

def ROP(request):
   instrument='ROP'
   return HttpResponse(str(datas[instrument]))

def ROST(request):
   instrument='ROST'
   return HttpResponse(str(datas[instrument]))

def RCL(request):
   instrument='RCL'
   return HttpResponse(str(datas[instrument]))

def SPGI(request):
   instrument='SPGI'
   return HttpResponse(str(datas[instrument]))

def CRM(request):
   instrument='CRM'
   return HttpResponse(str(datas[instrument]))

def SBAC(request):
   instrument='SBAC'
   return HttpResponse(str(datas[instrument]))

def SLB(request):
   instrument='SLB'
   return HttpResponse(str(datas[instrument]))

def STX(request):
   instrument='STX'
   return HttpResponse(str(datas[instrument]))

def SEE(request):
   instrument='SEE'
   return HttpResponse(str(datas[instrument]))

def SRE(request):
   instrument='SRE'
   return HttpResponse(str(datas[instrument]))

def NOW(request):
   instrument='NOW'
   return HttpResponse(str(datas[instrument]))

def SHW(request):
   instrument='SHW'
   return HttpResponse(str(datas[instrument]))

def SPG(request):
   instrument='SPG'
   return HttpResponse(str(datas[instrument]))

def SWKS(request):
   instrument='SWKS'
   return HttpResponse(str(datas[instrument]))

def SNA(request):
   instrument='SNA'
   return HttpResponse(str(datas[instrument]))

def SO(request):
   instrument='SO'
   return HttpResponse(str(datas[instrument]))

def LUV(request):
   instrument='LUV'
   return HttpResponse(str(datas[instrument]))

def SWK(request):
   instrument='SWK'
   return HttpResponse(str(datas[instrument]))

def SBUX(request):
   instrument='SBUX'
   return HttpResponse(str(datas[instrument]))

def STT(request):
   instrument='STT'
   return HttpResponse(str(datas[instrument]))

def STE(request):
   instrument='STE'
   return HttpResponse(str(datas[instrument]))

def SYK(request):
   instrument='SYK'
   return HttpResponse(str(datas[instrument]))

def SIVB(request):
   instrument='SIVB'
   return HttpResponse(str(datas[instrument]))

def SYF(request):
   instrument='SYF'
   return HttpResponse(str(datas[instrument]))

def SNPS(request):
   instrument='SNPS'
   return HttpResponse(str(datas[instrument]))

def SYY(request):
   instrument='SYY'
   return HttpResponse(str(datas[instrument]))

def TMUS(request):
   instrument='TMUS'
   return HttpResponse(str(datas[instrument]))

def TROW(request):
   instrument='TROW'
   return HttpResponse(str(datas[instrument]))

def TTWO(request):
   instrument='TTWO'
   return HttpResponse(str(datas[instrument]))

def TPR(request):
   instrument='TPR'
   return HttpResponse(str(datas[instrument]))

def TGT(request):
   instrument='TGT'
   return HttpResponse(str(datas[instrument]))

def TEL(request):
   instrument='TEL'
   return HttpResponse(str(datas[instrument]))

def TDY(request):
   instrument='TDY'
   return HttpResponse(str(datas[instrument]))

def TFX(request):
   instrument='TFX'
   return HttpResponse(str(datas[instrument]))

def TER(request):
   instrument='TER'
   return HttpResponse(str(datas[instrument]))

def TSLA(request):
   instrument='TSLA'
   return HttpResponse(str(datas[instrument]))

def TXN(request):
   instrument='TXN'
   return HttpResponse(str(datas[instrument]))

def TXT(request):
   instrument='TXT'
   return HttpResponse(str(datas[instrument]))

def COO(request):
   instrument='COO'
   return HttpResponse(str(datas[instrument]))

def HIG(request):
   instrument='HIG'
   return HttpResponse(str(datas[instrument]))

def HSY(request):
   instrument='HSY'
   return HttpResponse(str(datas[instrument]))

def MOS(request):
   instrument='MOS'
   return HttpResponse(str(datas[instrument]))

def TRV(request):
   instrument='TRV'
   return HttpResponse(str(datas[instrument]))

def DIS(request):
   instrument='DIS'
   return HttpResponse(str(datas[instrument]))

def TMO(request):
   instrument='TMO'
   return HttpResponse(str(datas[instrument]))

def TJX(request):
   instrument='TJX'
   return HttpResponse(str(datas[instrument]))

def TSCO(request):
   instrument='TSCO'
   return HttpResponse(str(datas[instrument]))

def TT(request):
   instrument='TT'
   return HttpResponse(str(datas[instrument]))

def TDG(request):
   instrument='TDG'
   return HttpResponse(str(datas[instrument]))

def TRMB(request):
   instrument='TRMB'
   return HttpResponse(str(datas[instrument]))

def TFC(request):
   instrument='TFC'
   return HttpResponse(str(datas[instrument]))

def TWTR(request):
   instrument='TWTR'
   return HttpResponse(str(datas[instrument]))

def TYL(request):
   instrument='TYL'
   return HttpResponse(str(datas[instrument]))

def TSN(request):
   instrument='TSN'
   return HttpResponse(str(datas[instrument]))

def USB(request):
   instrument='USB'
   return HttpResponse(str(datas[instrument]))

def UDR(request):
   instrument='UDR'
   return HttpResponse(str(datas[instrument]))

def ULTA(request):
   instrument='ULTA'
   return HttpResponse(str(datas[instrument]))

def UAA(request):
   instrument='UAA'
   return HttpResponse(str(datas[instrument]))

def UA(request):
   instrument='UA'
   return HttpResponse(str(datas[instrument]))

def UNP(request):
   instrument='UNP'
   return HttpResponse(str(datas[instrument]))

def UAL(request):
   instrument='UAL'
   return HttpResponse(str(datas[instrument]))

def UPS(request):
   instrument='UPS'
   return HttpResponse(str(datas[instrument]))

def URI(request):
   instrument='URI'
   return HttpResponse(str(datas[instrument]))

def UNH(request):
   instrument='UNH'
   return HttpResponse(str(datas[instrument]))

def UHS(request):
   instrument='UHS'
   return HttpResponse(str(datas[instrument]))

def VLO(request):
   instrument='VLO'
   return HttpResponse(str(datas[instrument]))

def VTR(request):
   instrument='VTR'
   return HttpResponse(str(datas[instrument]))

def VRSN(request):
   instrument='VRSN'
   return HttpResponse(str(datas[instrument]))

def VRSK(request):
   instrument='VRSK'
   return HttpResponse(str(datas[instrument]))

def VZ(request):
   instrument='VZ'
   return HttpResponse(str(datas[instrument]))

def VRTX(request):
   instrument='VRTX'
   return HttpResponse(str(datas[instrument]))

def VFC(request):
   instrument='VFC'
   return HttpResponse(str(datas[instrument]))

def VIAC(request):
   instrument='VIAC'
   return HttpResponse(str(datas[instrument]))

def VTRS(request):
   instrument='VTRS'
   return HttpResponse(str(datas[instrument]))

def V(request):
   instrument='V'
   return HttpResponse(str(datas[instrument]))

def VNO(request):
   instrument='VNO'
   return HttpResponse(str(datas[instrument]))

def VMC(request):
   instrument='VMC'
   return HttpResponse(str(datas[instrument]))

def WRB(request):
   instrument='WRB'
   return HttpResponse(str(datas[instrument]))

def GWW(request):
   instrument='GWW'
   return HttpResponse(str(datas[instrument]))

def WAB(request):
   instrument='WAB'
   return HttpResponse(str(datas[instrument]))

def WBA(request):
   instrument='WBA'
   return HttpResponse(str(datas[instrument]))

def WMT(request):
   instrument='WMT'
   return HttpResponse(str(datas[instrument]))

def WM(request):
   instrument='WM'
   return HttpResponse(str(datas[instrument]))

def WAT(request):
   instrument='WAT'
   return HttpResponse(str(datas[instrument]))

def WEC(request):
   instrument='WEC'
   return HttpResponse(str(datas[instrument]))

def WFC(request):
   instrument='WFC'
   return HttpResponse(str(datas[instrument]))

def WELL(request):
   instrument='WELL'
   return HttpResponse(str(datas[instrument]))

def WST(request):
   instrument='WST'
   return HttpResponse(str(datas[instrument]))

def WDC(request):
   instrument='WDC'
   return HttpResponse(str(datas[instrument]))

def WU(request):
   instrument='WU'
   return HttpResponse(str(datas[instrument]))

def WRK(request):
   instrument='WRK'
   return HttpResponse(str(datas[instrument]))

def WY(request):
   instrument='WY'
   return HttpResponse(str(datas[instrument]))

def WHR(request):
   instrument='WHR'
   return HttpResponse(str(datas[instrument]))

def WMB(request):
   instrument='WMB'
   return HttpResponse(str(datas[instrument]))

def WLTW(request):
   instrument='WLTW'
   return HttpResponse(str(datas[instrument]))

def WYNN(request):
   instrument='WYNN'
   return HttpResponse(str(datas[instrument]))

def XEL(request):
   instrument='XEL'
   return HttpResponse(str(datas[instrument]))

def XLNX(request):
   instrument='XLNX'
   return HttpResponse(str(datas[instrument]))

def XYL(request):
   instrument='XYL'
   return HttpResponse(str(datas[instrument]))

def YUM(request):
   instrument='YUM'
   return HttpResponse(str(datas[instrument]))

def ZBRA(request):
   instrument='ZBRA'
   return HttpResponse(str(datas[instrument]))

def ZBH(request):
   instrument='ZBH'
   return HttpResponse(str(datas[instrument]))

def ZION(request):
   instrument='ZION'
   return HttpResponse(str(datas[instrument]))

def ZTS(request):
   instrument='ZTS'
   return HttpResponse(str(datas[instrument]))

