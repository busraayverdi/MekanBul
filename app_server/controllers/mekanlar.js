//anaSayfa controller metodu
//index.js dosyasındaki router.get('/',ctrlMekanlar.anaSayfa);
//ile metot url'ye bağlanıyor
var request =require('request');
var apiSecenekleri={
	sunucu:"http://localhost:3000",
	apiYolu:'/api/mekanlar/'
};
var mesafeyiFormatla = function(mesafe){
	var yeniMesafe,birim;
	if (mesafe>1){
		yeniMesafe= parseFloat(mesafe).toFixed(1);
		birim='km';

	}else{
		yeniMesafe= parseInt(mesafe* 1000,10);
		birim='m';
	}
	return yeniMesafe + birim;
};
var anaSayfaOlustur=function(req,res,cevap,mekanListesi){
	var mesaj;
	if(!(mekanListesi instanceof Array)){
		mesaj="API HATASI:Birşeyler ters gitti";
		mekanListesi=[];

	}else{
		if(!mekanListesi.length){
			mesaj="civarında herhangi bir mekan bulunamadı";

	}
}
res.render('mekanlar-liste',
{
title: 'MekanBul-Yakınındaki Mekanları Bul',
sayfaBaslik:{
	siteAd:'MekanBul',
	aciklama:'Yakınınızdaki Kafeleri,Restoranları Bul'
},
mekanlar:mekanListesi,
mesaj:mesaj,
cevap:cevap
});
};
const anaSayfa=function(req,res){
	var istekSecenekleri;
	  istekSecenekleri=
	  {
	  	url: apiSecenekleri.sunucu + apiSecenekleri.apiYolu,
	  	method: "GET",
	  	json: {},
	  	qs:{
	  		enlem:req.query.enlem,
	  		boylam:req.query.boylam
	  }
	};
request(
	istekSecenekleri,
	function(hata,cevap,mekanlar){
		var i,gelenMekanlar;
		gelenMekanlar=mekanlar;
		if(!hata && gelenMekanlar.length){
			for(i=0;i<gelenMekanlar.length; i++){
				gelenMekanlar[i].mesafe =mesafeyiFormatla(gelenMekanlar[i].mesafe);
			}
		}
		anaSayfaOlustur(req,res,cevap,gelenMekanlar);
	}
   );	
	
}
//mekanBilgisi controller metodu
//index.js dosyasındaki router.get('/mekan', ctrlMekanlar.mekanBilgisi);
//ile metot url'ye bağlanıyor
var detaySayfasiOlustur =function(req,res,mekanDetaylari){
	res.render('mekan-detay',
	{
		baslik:mekanDetaylari.ad,
		sayfaBaslik:mekanDetaylari.ad,
		mekanBilgisi:mekanDetaylari

		
	});

}
var hataGoster =function(req,res,durum){
	var baslik,icerik;
	if(durum ==404){
		baslik="404,sayfa bulunamadı";
		icerik="kusura bakma sayfayı bulamadık";
	}else{
		baslik=durum+" birşeyler ters gitti";
		icerik="bir yerlere birşeyler ters gitti";

	}
	res.status(durum);
	res.render('hata',{
		title: baslik,
		content: icerik
	});
}
var mekanBilgisiGetir = function (req, res, callback) {
	var istekSecenekleri;

	istekSecenekleri = {

		url : apiSecenekleri.sunucu + apiSecenekleri.apiYolu + req.params.mekanid,
		method : "GET",
		json : {}
	};
	request(
		istekSecenekleri,
		function(hata, cevap, mekanDetaylari) {
			var gelenMekan = mekanDetaylari;
			if (!hata) {
			 gelenMekan.koordinatlar = {
			 	enlem : mekanDetaylari.koordinatlar[0],
			 	boylam: mekanDetaylari.koordinatlar[1]
			 };
			 callback(req, res,gelenMekan);

		} else {
			hataGoster(req, res, cevap.statusCode);
		}
		}
		);
};


const mekanBilgisi=function(req,res,callback){
	mekanBilgisiGetir(req, res, function(req, res, cevap) {
	 detaySayfasiOlustur(req, res, cevap);
	});
};
var yorumSayfasiOlustur = function (req, res, mekanBilgisi) {
  res.render('yorum-ekle', { baslik: mekanBilgisi.ad+ ' Mekanına Yorum Ekle ',
    sayfaBaslik:mekanBilgisi.ad+ ' Mekanına Yorum Ekle ' ,
    hata: req.query.hata
  });  	
};

const yorumEkle=function(req,res){
  mekanBilgisiGetir(req, res, function(req, res, cevap) {
  	yorumSayfasiOlustur(req, res, cevap);
  }); 	
}

//yorumEkle controller metodu
//index.js dosyasındaki router.get('/mekan/yorum/yeni', ctrlMekanlar.yorumEkle);
//ile metot url'ye bağlanıyor

const yorumumuEkle = function(req,res){
  var istekSecenekleri, gonderilenYorum,mekanid;
  mekanid = req.params.mekanid;
  gonderilenYorum = {
	yorumYapan: req.body.name,
	puan:parseInt(req.body.rating, 10),
	yorumMetni: req.body.review
  };
  istekSecenekleri = {
	url : apiSecenekleri.sunucu+ apiSecenekleri.apiYolu+mekanid+'/yorumlar',
	method : "POST",
	json : gonderilenYorum
  };
  if (!gonderilenYorum.yorumYapan || !gonderilenYorum.yorumMetni) {
	res.redirect('/mekan/' + mekannid + '/yorum/yeni?hata=evet');
  } else {
	request(
	  istekSecenekleri,
	  function(hata, cevap, body) {
		if (cevap.statusCode === 201) {
			res.redirect('/mekan/' +mekanid);
		}
		else if (cevap.statusCode === 400 && body.name && body.name === "ValidationError" ) {
		  res.redirect('/mekan/' + mekanid + '/yorum/yeni?hata=evet');
		}
		else {
		   hataGoster(req, res, cevap.statusCode);
		}
	}
	);
   }
};
	
//metotlarımızı kullanmak üzere dış dünyaya aç
//diğer dosyalardan require ile alabilmemizi sağlayacak
module.exports = {
anaSayfa,
mekanBilgisi,
yorumEkle,
yorumumuEkle
};

