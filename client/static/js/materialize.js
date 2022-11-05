/*!
 * Materialize v1.0.0 (http://materializecss.com)
 * Copyright 2014-2017 Materialize
 * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)
 */
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*! cash-dom 1.3.5, https://github.com/kenwheeler/cash @license MIT */
(function (factory) {
  window.cash = factory();
})(function () {
  var doc = document,
      win = window,
      ArrayProto = Array.prototype,
      slice = ArrayProto.slice,
      filter = ArrayProto.filter,
      push = ArrayProto.push;

  var noop = function () {},
      isFunction = function (item) {
    // @see https://crbug.com/568448
    return typeof item === typeof noop && item.call;
  },
      isString = function (item) {
    return typeof item === typeof "";
  };

  var idMatch = /^#[\w-]*$/,
      classMatch = /^\.[\w-]*$/,
      htmlMatch = /<.+>/,
      singlet = /^\w+$/;

  function find(selector, context) {
    context = context || doc;
    var elems = classMatch.test(selector) ? context.getElementsByClassName(selector.slice(1)) : singlet.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector);
    return elems;
  }

  var frag;
  function parseHTML(str) {
    if (!frag) {
      frag = doc.implementation.createHTMLDocument(null);
      var base = frag.createElement("base");
      base.href = doc.location.href;
      frag.head.appendChild(base);
    }

    frag.body.innerHTML = str;

    return frag.body.childNodes;
  }

  function onReady(fn) {
    if (doc.readyState !== "loading") {
      fn();
    } else {
      doc.addEventListener("DOMContentLoaded", fn);
    }
  }

  function Init(selector, context) {
    if (!selector) {
      return this;
    }

    // If already a cash collection, don't do any further processing
    if (selector.cash && selector !== win) {
      return selector;
    }

    var elems = selector,
        i = 0,
        length;

    if (isString(selector)) {
      elems = idMatch.test(selector) ?
      // If an ID use the faster getElementById check
      doc.getElementById(selector.slice(1)) : htmlMatch.test(selector) ?
      // If HTML, parse it into real elements
      parseHTML(selector) :
      // else use `find`
      find(selector, context);

      // If function, use as shortcut for DOM ready
    } else if (isFunction(selector)) {
      onReady(selector);return this;
    }

    if (!elems) {
      return this;
    }

    // If a single DOM element is passed in or received via ID, return the single element
    if (elems.nodeType || elems === win) {
      this[0] = elems;
      this.length = 1;
    } else {
      // Treat like an array and loop through each item.
      length = this.length = elems.length;
      for (; i < length; i++) {
        this[i] = elems[i];
      }
    }

    return this;
  }

  function cash(selector, context) {
    return new Init(selector, context);
  }

  var fn = cash.fn = cash.prototype = Init.prototype = { // jshint ignore:line
    cash: true,
    length: 0,
    push: push,
    splice: ArrayProto.splice,
    map: ArrayProto.map,
    init: Init
  };

  Object.defineProperty(fn, "constructor", { value: cash });

  cash.parseHTML = parseHTML;
  cash.noop = noop;
  cash.isFunction = isFunction;
  cash.isString = isString;

  cash.extend = fn.extend = function (target) {
    target = target || {};

    var args = slice.call(arguments),
        length = args.length,
        i = 1;

    if (args.length === 1) {
      target = this;
      i = 0;
    }

    for (; i < length; i++) {
      if (!args[i]) {
        continue;
      }
      for (var key in args[i]) {
        if (args[i].hasOwnProperty(key)) {
          target[key] = args[i][key];
        }
      }
    }

    return target;
  };

  function each(collection, callback) {
    var l = collection.length,
        i = 0;

    for (; i < l; i++) {
      if (callback.call(collection[i], collection[i], i, collection) === false) {
        break;
      }
    }
  }

  function matches(el, selector) {
    var m = el && (el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector);
    return !!m && m.call(el, selector);
  }

  function getCompareFunction(selector) {
    return (
      /* Use browser's `matches` function if string */
      isString(selector) ? matches :
      /* Match a cash element */
      selector.cash ? function (el) {
        return selector.is(el);
      } :
      /* Direct comparison */
      function (el, selector) {
        return el === selector;
      }
    );
  }

  function unique(collection) {
    return cash(slice.call(collection).filter(function (item, index, self) {
      return self.indexOf(item) === index;
    }));
  }

  cash.extend({
    merge: function (first, second) {
      var len = +second.length,
          i = first.length,
          j = 0;

      for (; j < len; i++, j++) {
        first[i] = second[j];
      }

      first.length = i;
      return first;
    },

    each: each,
    matches: matches,
    unique: unique,
    isArray: Array.isArray,
    isNumeric: function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  });

  var uid = cash.uid = "_cash" + Date.now();

  function getDataCache(node) {
    return node[uid] = node[uid] || {};
  }

  function setData(node, key, value) {
    return getDataCache(node)[key] = value;
  }

  function getData(node, key) {
    var c = getDataCache(node);
    if (c[key] === undefined) {
      c[key] = node.dataset ? node.dataset[key] : cash(node).attr("data-" + key);
    }
    return c[key];
  }

  function removeData(node, key) {
    var c = getDataCache(node);
    if (c) {
      delete c[key];
    } else if (node.dataset) {
      delete node.dataset[key];
    } else {
      cash(node).removeAttr("data-" + name);
    }
  }

  fn.extend({
    data: function (name, value) {
      if (isString(name)) {
        return value === undefined ? getData(this[0], name) : this.each(function (v) {
          return setData(v, name, value);
        });
      }

      for (var key in name) {
        this.data(key, name[key]);
      }

      return this;
    },

    removeData: function (key) {
      return this.each(function (v) {
        return removeData(v, key);
      });
    }

  });

  var notWhiteMatch = /\S+/g;

  function getClasses(c) {
    return isString(c) && c.match(notWhiteMatch);
  }

  function hasClass(v, c) {
    return v.classList ? v.classList.contains(c) : new RegExp("(^| )" + c + "( |$)", "gi").test(v.className);
  }

  function addClass(v, c, spacedName) {
    if (v.classList) {
      v.classList.add(c);
    } else if (spacedName.indexOf(" " + c + " ")) {
      v.className += " " + c;
    }
  }

  function removeClass(v, c) {
    if (v.classList) {
      v.classList.remove(c);
    } else {
      v.className = v.className.replace(c, "");
    }
  }

  fn.extend({
    addClass: function (c) {
      var classes = getClasses(c);

      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          addClass(v, c, spacedName);
        });
      }) : this;
    },

    attr: function (name, value) {
      if (!name) {
        return undefined;
      }

      if (isString(name)) {
        if (value === undefined) {
          return this[0] ? this[0].getAttribute ? this[0].getAttribute(name) : this[0][name] : undefined;
        }

        return this.each(function (v) {
          if (v.setAttribute) {
            v.setAttribute(name, value);
          } else {
            v[name] = value;
          }
        });
      }

      for (var key in name) {
        this.attr(key, name[key]);
      }

      return this;
    },

    hasClass: function (c) {
      var check = false,
          classes = getClasses(c);
      if (classes && classes.length) {
        this.each(function (v) {
          check = hasClass(v, classes[0]);
          return !check;
        });
      }
      return check;
    },

    prop: function (name, value) {
      if (isString(name)) {
        return value === undefined ? this[0][name] : this.each(function (v) {
          v[name] = value;
        });
      }

      for (var key in name) {
        this.prop(key, name[key]);
      }

      return this;
    },

    removeAttr: function (name) {
      return this.each(function (v) {
        if (v.removeAttribute) {
          v.removeAttribute(name);
        } else {
          delete v[name];
        }
      });
    },

    removeClass: function (c) {
      if (!arguments.length) {
        return this.attr("class", "");
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        each(classes, function (c) {
          removeClass(v, c);
        });
      }) : this;
    },

    removeProp: function (name) {
      return this.each(function (v) {
        delete v[name];
      });
    },

    toggleClass: function (c, state) {
      if (state !== undefined) {
        return this[state ? "addClass" : "removeClass"](c);
      }
      var classes = getClasses(c);
      return classes ? this.each(function (v) {
        var spacedName = " " + v.className + " ";
        each(classes, function (c) {
          if (hasClass(v, c)) {
            removeClass(v, c);
          } else {
            addClass(v, c, spacedName);
          }
        });
      }) : this;
    } });

  fn.extend({
    add: function (selector, context) {
      return unique(cash.merge(this, cash(selector, context)));
    },

    each: function (callback) {
      each(this, callback);
      return this;
    },

    eq: function (index) {
      return cash(this.get(index));
    },

    filter: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = isFunction(selector) ? selector : getCompareFunction(selector);

      return cash(filter.call(this, function (e) {
        return comparator(e, selector);
      }));
    },

    first: function () {
      return this.eq(0);
    },

    get: function (index) {
      if (index === undefined) {
        return slice.call(this);
      }
      return index < 0 ? this[index + this.length] : this[index];
    },

    index: function (elem) {
      var child = elem ? cash(elem)[0] : this[0],
          collection = elem ? this : cash(child).parent().children();
      return slice.call(col@PÂ@0ì!]9j[ØËtû[_´AE~¯÷ÔöMuĞ×ˆyµ?mûƒ0©gùoOã‚ÚJM$œû?ö%h¹T@T´ÏQšß‹ñMlæ4/õÏe½F ³ù I¶*ş¶İQ|×ªÖ2@(ßÚ¼‰¡RYêÊ>k½p?~Ï10~§î|)Y:ãök¦GJ{C8ºä½ìjTN¾òpéa¦"d-»·ígİØœHx4-½±RKf¾ä(ßò®&ä©¥…èpÏ*æïH¹|Êİ€!•s¢œŸÖEŒ§Ôªo†-¢è(„+bs&ÁBRIø+<MÌÃ™‰‘Ïá5²AK‘dLàõh#Á#„w­C-†}u]?W+‚]›)gZHùøjğšĞ³´ıWwÈÂY/ÆU–mZÌùnqeq ç>öÙ6¶:cšÈß¢ëx09u$ÀmQg“,ë0muuCGRŞû>hÀ˜¡ <Ü*ËCMj·PkWzÅ÷¼¿Ã¤uûD¶ÙÜ2haGõU5%sYÌİüïLîî&yì#d>±oVËVœƒaáâğšY®]È[D\™1=q~<°Ug¾èxâæ§­`õDÿ[â—¬ËFë´HfyMÕ¼İ`ÿĞ¸7ôî½j/Ìwğyƒ•ø>j?J×ù«&®úÄï×\ÉûÔƒƒâ°7ßìáÙtjê“²ìTö€mqöRÖøırªmvz6•ØËØ×ĞçÁ›`OÕO³4—¢TFŸÎ™‡ÀÖË!vŸlnbû5¥[%·ç6òJş—}xNĞÛ÷	Ñ­ÆP$ ğÍãì9Ò|÷ `=œµ7dÌN«*õ±ùŞ^AÊàrßÿ€èÈÈÃåbîQŞÜ™¬>úK›#:9’„;†ÿ0æKò¤¼İ%AÏ†!xƒiMŸ_5°yT‰Êdó4VKjÜu¸Û(gag:«¥©ïXû•¹¦{Ê¡*¦.æK)G 0f÷¡1–PXWöÈ­3É"-ét+¦#uHHoôÊŠ?´*úªbåROläaE N·J³Ø–oı³•ÎW¥)Ú<aã"Ïª‘¿F³¾Ej^d²B*3â™î¬ˆà‚@Áå§îbÇÇk¸°£+tü‚~€!	¬3Gl›	©šß rÚGCa­IÁ¼s ÓeÒK©p)Ó|±m×À8,HÈ„wİ „íq9eÍ1Å—­VÔP©ZSAÍèd£q…©B¨m½Wa%Å:’çOK÷ĞjıãË5˜c	Uzœ;$‰„jrÏ8$İ÷ĞåÎaÜÕyÑH=8bÛ7ñ‹şã™ç6û©º¥È,/)=’{0t³ˆ+2óm„çF.¶ÍæC:^´”ëa}páWÁ{şA—d±Ë¸Ãƒx°µıØÇÌ,¡ô9œ-g™sÏá‘Gd c¾—YÁ×¼?+´@À±fÃG§çï²Üyn.ïçWw4tb¾88ˆ±|ÀB·ÏF-îçì—›ûùZó¤vÏ2l>*µô¸IÌiJ4#¯SÌ²X *4|ê–Z
+„ÒŸÿXÈºØ¬šşÙ©Ûñ(%a?;½¬Ş+(fà¯FâÔßÊ7M:¨9“­Õp;¥Àš°ÌC2|Ôh~¶Å· f@ş±ì%¦Ÿ³ß„à}œLŞb®—(ª^‘z‚>uäŒú‘ä§³[k=ç"O`åLã÷ª5JÂÄl—ë¦•¯X>u|<¤y£¯xª÷qı%9ŞFî?ªk¿0
6+hBC&ÀzDXšê`±­É¨ú;ö<ÛA¦ü+$Ìë“çpésÃB!n3ŒuõMÍÍKZ¸ûnO¡•XtÀ<<Ûv4%Š¤Vœ(äØëriÚÆ
–-ÿ*Oé*E.OİõÛÅe¢mK´t4¿|xW¨]MÆ2Šêá5/DzÇúÓ d×v—àÇûu„hf!d2Ë€¸™ÎÆçàw¼|DÑ9²^@ö@¨fy?ñÊe@¯EİÀ®•Ğ£M|ÓU&8µŸH%Ğ0²”2ôO pZÎ:ù45%‘ÍÕdÜ·üó„:ô,»ˆóïÎk¤Y9Ú.÷şU-æ‰²ø}/4b5xê`ò4©…|$K!°±ç&ürİ6Në’ÿ%«…³HQæ÷²T%Ñ8IÈ“Íü`Î›~ÕËñ©µ§’(NWZ®Z“To±xÍ	¿&0ÁT‘X…6Ú‚¬`HªÏTÎôß'æå`$µ=õj‹z Ş8|w¢¥äºŸı8qÙÀFaò4ÑÃÍ òô-¯Í?*Ä?± MëûËÈ5Ò¥ ¹'AÂƒ÷Û*ìùÀ¨“ °9·$½©eŸJC>NØ¶ö$ë8SRí@µs3°µ×BI)?‰Á‡uxmr`¯;@ÛÕEfÌ{(n+<ë)rĞ3r9ÈÓµêÎg sUS6¸êó¨-TpY®-‹,“TD[!IØFˆÄ,ÄD²é-À¹e$•œ4¶
»Çy' ıê?¾É°y\"F™a\´¿G]Ş‰³ü¡·Xø ñË_#.ËôrwbE5¡BCmšà@FØÙQ¯~Å>¹ofr5Kæá|Î¡ªëø`N÷W&§Ñ!Ûª¨%ßªƒÊ¤nö-GCf@ÊÂ˜ìıv­òYPÒKÉcK“3ÕÕi±hm•—!F»TJ8­Ï\&ÙYrşßV°J'Å¦Æ4ˆhdp<‹b“ŸV½QÎÿØödğ{[EKër°©ĞTğüÆÄ	ÄëQ		<^Ï¿96­}%RĞvé[RâÚzşWŞ¯¬ú0‰W9sÛd§Å|¬8d[,«É'“Æ·6RuòtÇjìĞ²$R»Ö‹U¦ÙE$K¡/z¸02N¬o\Ll¹úÕáüï’_Veƒ1—‡ì–Nõ^ÉÉ~KºZ~<”îÃPĞKE 3şá½¥`<ÒbÓ¹ÉÈf 2åPüêÔY%èïpw‹ÍäÇàç]”ÍÍŒì©*ÏúÃ›¨iÂ”vŠ4¢ZâJİ‚_¦Yßm5!`Ï"İ9Ÿ^U×ëÎyşw‘­Myˆay½¸T;·0¨ûbÙ
a±HÙ> P5ÚòA: ‘5Ãj<
ñ1Ë	,Ìerö=ég…¼Ğÿ5½°É_TğPêƒˆĞ÷?b+*>-ï Ìg\şcÕx|	{JXˆÇKAó5A<ª\ŸÇ´Ä¿•Ûà	b€
™•²q2¢k÷mH‰¨ò‚÷4Ù´y:È`ˆ^4ù_]=Ä¯“PÜ¢­Ëğ(ÓwY¯ª2‰xÂ€›ki¬«:Zc˜Éé¡€V©i”®âi¨0×»CÌ0æ rÆ !™Í·3l‹ÙÍ/h/HÔ2TP*q	6ıDqŒÍ˜“9Ï÷ÇqÁíx°Â‰ŸÁlÎ6†b èë[Ïë(¥½›ª0ƒ¡Õñ
õ€W]â¨e–ÉETÌ¼b—áVk¬'¿Œ4ò(›š¼¸Œş)¾šŞø%ŒWâ(Ç¬9D¹£'/€f`W[µéıSƒÖúañ Ñ$4ÿ3÷ã%ÀÌƒÓîÚ8;„¸#’Éø)ÓfÍCYÔÿ‚íˆOú!®“>òÎE¢ÓZüñ’'1
îå!?7ÖMØ2·l 0}ÿ	ù“›a>Pò¤ÎïÉƒ“j°æÙ5WfİÂ>tPlÜo°9ÿA{§š±1jƒ–¦¢+ÕF 66Ã¬¶[!¢õ‡†VìlåFKMç¸|·ñ› «.Y‰ƒş¿Ş#â¡4åz`­¸Tugiy"øMßşúà6íFÖ'?`$ËÅ®ƒã_Á?ERVÔc\++@RöQĞ	Šø;ª%õlKÕÍ:³ø}–Xz	nĞõ<Ö˜½Ö9DÕÖ´Ö×ÓÅ4S“qk¸fh`âJß!8ho!v«ÆL¦°kü6€@¿·Á\ÙÉzbÌ'ÉD|ø°ÙuT"bõz0Õxÿ‚•¯RÔ±N˜€˜õI³h”µ5…×œrÿJ)À…°Y@vP8?p„Åo’õ¨n2½™}q*Ïç…n„b+JG·<ÖèâhŞ_±Ú¶›»Ğ†}ıçW—÷4Xú,^xi×lîK`^^pÓÎÍøÖéšEßu/…F;áÍ%}ÔXE†“/£ù2#P&‹«İ°Í‚Fì¯Aw:
{½“±î}Sèˆ‰X’6´äá9,ò\6Õ·iıÁÀ5ÃGa|HPŸß¹½œo†éÕHYĞÉ:mV°bÈÛŞÅ%¤³8¤‚ û'0âPù
,¨ó%” ¹÷æUè‰Q•4Î-Á".#ÈÃ÷.óbDÿİK·ƒàš’¹&A6£Ø"°(æ4_‚ds/à=±â¹ñ×Mu/ıS_¬dç‡ŞÁu29Yô@'´âıókùçtp[E©’}Ô}4€öá3•¾Å3:o‰¢AŸöh}J/6*yü&ÍÑóœ£1®oIÊ–º±•­Àú½|^ï±3'ŸWAÔ5B›QePŒ¬D æîÚÇ¹ä´îSëá¬ Ã¯øTm'QTT$°M%¢9˜O¶Nu›¿qPâ–Â¯»ÿ#Â‘•v’ĞÛ/èx£½æşk oUNP*]sßµşM‰isi’ÃDãnRÇÁ,~“S«'õ{çrë‡Î#“I³YÓ2C÷û¿ÆÀ€Çfÿ	™g-!ü%£VD×kÿ Ê˜OÈŠÀ•Ş+Wß 9›EŞâ‰ (ò¥;’É™Wñ—”ª2ó{œ³Ç#¸ìÊ	“4U›
©S3Soååì’1H€'IF¬îki9Ú‘
M’ä{ĞUimMÖü¹]Ã©¡BÈÀã+”$™fÏaI.cåıæ“¸¯İö`ÚøÅÇ4ëìJ¬ƒ»rù„¶üBëõ<GãÌ5÷Qc§zŒná(*³,¾¹±R(¬T×ÚæŸ>ÇéTDkœ³–×;»†ÌíÅ(‰é…>:ÆòFvI7Î•¬³ø¯şLæ‰?5ºÿÊ˜HKÃé¦÷Q©`}½rì¯>ı³UQŞ*®J†RïÖH¨Z0]ã*§¬}[Ï`v"¼p
¹¢GVlº«õ€ó&©‚ÿf#e¿Dfò×ÅS	¶F‹5^®=éïÕO9[ª3âµAp›Õ(ˆTş f.åzıŞ¥rÌ¦äFøC&Àç‡o@‹úÛ®úÌ{”fºN­±&-Ù3"zùdÓ?ğîˆI"¶ack = function () {
            callback.apply(this, arguments);
            removeEvent(v, eventName, finalCallback);
          };
        }
        registerEvent(v, eventName, finalCallback);
      });
    },

    one: function (eventName, delegate, callback) {
      return this.on(eventName, delegate, callback, true);
    },

    ready: onReady,

    /**
     * Modified
     * Triggers browser event
     * @param String eventName
     * @param Object data - Add properties to event object
     */
    trigger: function (eventName, data) {
      if (document.createEvent) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(eventName, true, false);
        evt = this.extend(evt, data);
        return this.each(function (v) {
          return v.dispatchEvent(evt);
        });
      }
    }

  });

  function encode(name, value) {
    return "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  function getSelectMultiple_(el) {
    var values = [];
    each(el.options, function (o) {
      if (o.selected) {
        values.push(o.value);
      }
    });
    return values.length ? values : null;
  }

  function getSelectSingle_(el) {
    var selectedIndex = el.selectedIndex;
    return selectedIndex >= 0 ? el.options[selectedIndex].value : null;
  }

  function getValue(el) {
    var type = el.type;
    if (!type) {
      return null;
    }
    switch (type.toLowerCase()) {
      case "select-one":
        return getSelectSingle_(el);
      case "select-multiple":
        return getSelectMultiple_(el);
      case "radio":
        return el.checked ? el.value : null;
      case "checkbox":
        return el.checked ? el.value : null;
      default:
        return el.value ? el.value : null;
    }
  }

  fn.extend({
    serialize: function () {
      var query = "";

      each(this[0].elements || this, function (el) {
        if (el.disabled || el.tagName === "FIELDSET") {
          return;
        }
        var name = el.name;
        switch (el.type.toLowerCase()) {
          case "file":
          case "reset":
          case "submit":
          case "button":
            break;
          case "select-multiple":
            var values = getValue(el);
            if (values !== null) {
              each(values, function (value) {
                query += encode(name, value);
              });
            }
            break;
          default:
            var value = getValue(el);
            if (value !== null) {
              query += encode(name, value);
            }
        }
      });

      return query.substr(1);
    },

    val: function (value) {
      if (value === undefined) {
        return getValue(this[0]);
      }

      return this.each(function (v) {
        return v.value = value;
      });
    }

  });

  function insertElement(el, child, prepend) {
    if (prepend) {
      var first = el.childNodes[0];
      el.insertBefore(child, first);
    } else {
      el.appendChild(child);
    }
  }

  function insertContent(parent, child, prepend) {
    var str = isString(child);

    if (!str && child.length) {
      each(child, function (v) {
        return insertContent(parent, v, prepend);
      });
      return;
    }

    each(parent, str ? function (v) {
      return v.insertAdjacentHTML(prepend ? "afterbegin" : "beforeend", child);
    } : function (v, i) {
      return insertElement(v, i === 0 ? child : child.cloneNode(true), prepend);
    });
  }

  fn.extend({
    after: function (selector) {
      cash(selector).insertAfter(this);
      return this;
    },

    append: function (content) {
      insertContent(this, content);
      return this;
    },

    appendTo: function (parent) {
      insertContent(cash(parent), this);
      return this;
    },

    before: function (selector) {
      cash(selector).insertBefore(this);
      return this;
    },

    clone: function () {
      return cash(this.map(function (v) {
        return v.cloneNode(true);
      }));
    },

    empty: function () {
      this.html("");
      return this;
    },

    html: function (content) {
      if (content === undefined) {
        return this[0].innerHTML;
      }
      var source = content.nodeType ? content[0].outerHTML : content;
      return this.each(function (v) {
        return v.innerHTML = source;
      });
    },

    insertAfter: function (selector) {
      var _this = this;

      cash(selector).each(function (el, i) {
        var parent = el.parentNode,
            sibling = el.nextSibling;
        _this.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), sibling);
        });
      });

      return this;
    },

    insertBefore: function (selector) {
      var _this2 = this;
      cash(selector).each(function (el, i) {
        var parent = el.parentNode;
        _this2.each(function (v) {
          parent.insertBefore(i === 0 ? v : v.cloneNode(true), el);
        });
      });
      return this;
    },

    prepend: function (content) {
      insertContent(this, content, true);
      return this;
    },

    prependTo: function (parent) {
      insertContent(cash(parent), this, true);
      return this;
    },

    remove: function () {
      return this.each(function (v) {
        if (!!v.parentNode) {
          return v.parentNode.removeChild(v);
        }
      });
    },

    text: function (content) {
      if (content === undefined) {
        return this[0].textContent;
      }
      return this.each(function (v) {
        return v.textContent = content;
      });
    }

  });

  var docEl = doc.documentElement;

  fn.extend({
    position: function () {
      var el = this[0];
      return {
        left: el.offsetLeft,
        top: el.offsetTop
      };
    },

    offset: function () {
      var rect = this[0].getBoundingClientRect();
      return {
        top: rect.top + win.pageYOffset - docEl.clientTop,
        left: rect.left + win.pageXOffset - docEl.clientLeft
      };
    },

    offsetParent: function () {
      return cash(this[0].offsetParent);
    }

  });

  fn.extend({
    children: function (selector) {
      var elems = [];
      this.each(function (el) {
        push.apply(elems, el.children);
      });
      elems = unique(elems);

      return !selector ? elems : elems.filter(function (v) {
        return matches(v, selector);
      });
    },

    closest: function (selector) {
      if (!selector || this.length < 1) {
        return cash();
      }
      if (this.is(selector)) {
        return this.filter(selector);
      }
      return this.parent().closest(selector);
    },

    is: function (selector) {
      if (!selector) {
        return false;
      }

      var match = false,
          comparator = getCompareFunction(selector);

      this.each(function (el) {
        match = comparator(el, selector);
        return !match;
      });

      return match;
    },

    find: function (selector) {
      if (!selector || selector.nodeType) {
        return cash(selector && this.has(selector).length ? selector : null);
      }

      var elems = [];
      this.each(function (el) {
        push.apply(elems, find(selector, el));
      });

      return unique(elems);
    },

    has: function (selector) {
      var comparator = isString(selector) ? function (el) {
        return find(selector, el).length !== 0;
      } : function (el) {
        return el.contains(selector);
      };

      return this.filter(comparator);
    },

    next: function () {
      return cash(this[0].nextElementSibling);
    },

    not: function (selector) {
      if (!selector) {
        return this;
      }

      var comparator = getCompareFunction(selector);

      return this.filter(function (el) {
        return !comparator(el, selector);
      });
    },

    parent: function () {
      var result = [];

      this.each(function (item) {
        if (item && item.parentNode) {
          result.push(item.parentNode);
        }
      });

      return unique(result);
    },

    parents: function (selector) {
      var last,
          result = [];

      this.each(function (item) {
        last = item;

        while (last && last.parentNode && last !== doc.body.parentNode) {
          last = last.parentNode;

          if (!selector || selector && matches(last, selector)) {
            result.push(last);
          }
        }
      });

      return unique(result);
    },

    prev: function () {
      return cash(this[0].previousElementSibling);
    },

    siblings: function (selector) {
      var collection = this.parent().children(selector),
          el = this[0];

      return collection.filter(function (i) {
        return i !== el;
      });
    }

  });

  return cash;
});
;
var Component = function () {
  /**
   * Generic constructor for all components
   * @constructor
   * @param {Element} el
   * @param {Object} options
   */
  function Component(classDef, el, options) {
    _classCallCheck(this, Component);

    // Display error if el is valid HTML Element
    if (!(el instanceof Element)) {
      console.error(Error(el + ' is not an HTML Element'));
    }

    // If exists, destroy and reinitialize in child
    var ins = classDef.getInstance(el);
    if (!!ins) {
      ins.destroy();
    }

    this.el = el;
    this.$el = cash(el);
  }

  /**
   * Initializes components
   * @param {class} classDef
   * @param {Element | NodeList | jQuery} els
   * @param {Object} options
   */


  _createClass(Component, null, [{
    key: "init",
    value: function init(classDef, els, options) {
      var instances = null;
      if (els instanceof Element) {
        instances = new classDef(els, options);
      } else if (!!els && (els.jquery || els.cash || els instanceof NodeList)) {
        var instancesArr = [];
        for (var i = 0; i < els.length; i++) {
          instancesArr.push(new classDef(els[i], options));
        }
        instances = instancesArr;
      }

      return instances;
    }
  }]);

  return Component;
}();

; // Required for Meteor package, the use of window prevents export by Meteor
(function (window) {
  if (window.Package) {
    M = {};
  } else {
    window.M = {};
  }

  // Check for jQuery
  M.jQueryLoaded = !!window.jQuery;
})(window);

// AMD
if (typeof define === 'function' && define.amd) {
  define('M', [], function () {
    return M;
  });

  // Common JS
} else if (typeof exports !== 'undefined' && !exports.nodeType) {
  if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
    exports = module.exports = M;
  }
  exports.default = M;
}

M.version = '1.0.0';

M.keys = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  ARROW_UP: 38,
  ARROW_DOWN: 40
};

/**
 * TabPress Keydown handler
 */
M.tabPressed = false;
M.keyDown = false;
var docHandleKeydown = function (e) {
  M.keyDown = true;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = true;
  }
};
var docHandleKeyup = function (e) {
  M.keyDown = false;
  if (e.which === M.keys.TAB || e.which === M.keys.ARROW_DOWN || e.which === M.keys.ARROW_UP) {
    M.tabPressed = false;
  }
};
var docHandleFocus = function (e) {
  if (M.keyDown) {
    document.body.classList.add('keyboard-focused');
  }
};
var docHandleBlur = function (e) {
  document.body.classList.remove('keyboard-focused');
};
document.addEventListener('keydown', docHandleKeydown, true);
document.addEventListener('keyup', docHandleKeyup, true);
document.addEventListener('focus', docHandleFocus, true);
document.addEventListener('blur', docHandleBlur, true);

/**
 * Initialize jQuery wrapper for plugin
 * @param {Class} plugin  javascript class
 * @param {string} pluginName  jQuery plugin name
 * @param {string} classRef  Class reference name
 */
M.initializeJqueryWrapper = function (plugin, pluginName, classRef) {
  jQuery.fn[pluginName] = function (methodOrOptions) {
    // Call plugin method if valid method name is passed in
    if (plugin.prototype[methodOrOptions]) {
      var params = Array.prototype.slice.call(arguments, 1);

      // Getter methods
      if (methodOrOptions.slice(0, 3) === 'get') {
        var instance = this.first()[0][classRef];
        return instance[methodOrOptions].apply(instance, pæ'IZÈŞá÷GŒ¯|ÚòCKñ H@Ïñê™øÛş“ò¿kYù_j?™.ÆQ3¡O»K£\ÚÛ†ò=ºTw½E¿eD>¶¶Á÷–…5O&e´Ÿ®å£âA¿e#4F&Ó›p–U°°,qò]øÙÔ øIÖ2ÆŸ=Ğ®Q§ÉëşóÇº¡ÓzİOJB^_•¸şÔqşêv€á@Ys+Rå†LÕïá2Ï„Át¦¸6¤«g´Nı9Ç÷Å+ÑÅœîO¢ÿõ¨´œ|&ò”ØrÚˆfI(Ã~­»”ÓÍt©È%02ğ;e°óª‹Ë£ZÚî§Eıôïõ÷çâ½†½ ,“â9LïKØ­‚;‘®·‚°·]Š™‚,©¢/øX£òpÇtjìÇ0ôâo/|€Qô´d¹ÍEÿ\Uãû×ºx¶´M_uóİNiŠë‡alİT_L7àğ œ |÷¦íÕ¿%ÒÃ!¦ƒqŒêypªYç¬¸‡ÎÜ7·qùGlÃOKSé=z±.@rŸ=
/¡yémn E—$ËµöØ¥½¬]);,òœc¹Ş9ä_eœ%¹sE½ûŸ¡FJú™K‰ŠÈD5ÕÓGSxj(ÕÅ²UÄW9caã)rŞÀÁíh,à'´_­	ãË‡†ºÎAP¤úè»w˜´n©£ödÏ_èsŠYÑ×šwEjQP£Ëdm)ß©'„}«”	»øx†Æ:1Û°“×9-¤ö&‡%àŞ 9š+0Åù¬­´^ÃÓÆqîG8WØ{Š[nû[#TäŸĞ€t¥úT.âşc…x,Õ Pr½
=ƒ‘ 4HTTû%o"›×”²GèŸæ:=ÆAÉT÷Ûçš¸ÉMO\fÛIËïĞBœš	àn—rX*³ ÓUş³¸[F+İ¡É-ù®6c­Ÿyrm’d„@é_`N;çpœÒ/Øb­ªÁåy¹óè(³ …¹_‡I¯‡¸cl¶rº6Æ#Cü,Ô8–?>j73¾˜€­QÜ ˜€í‡áùÄµâ± £5NÇëäŞSºæÙâí-ÿJx¼fš…Ó[÷QŠ©ùXÒ)!£¥Q5ƒîL0ß<5ŠŠÍXî~2ª~ÌÈÅqÌÅÂ ğ;<D¼ *”;Ëvâç†JöÊˆók[¥š’A·]vkR>5o;XV'‚ cáu¦A²«Ğ)ûY^Rt¬A-–G\Üz™M:­Õbã€B¯'©	˜ëŠ"Ú(û«YAI¡Bt«İ±	nC-rxèü%H¥Üˆ73¾YüƒTóƒœÙNm¿ëJŞÒğªßi«Ì‹8ïV‡ôñ›l‰+ kÂ'„Dü0È7ŠDüzeŞÃÊì6ÖÑ«]3ÒÁ!ÖMÍÿ 5’j*›o<%oÒ¤Ñk/*ÿtÄ)(.(y	î_ŒWø²ìÀxÜíU¢…Íí&>ˆ^Ø–+ÉG/Â>0Ê	…	™ŠTğø x…+Ûji‘'âÅ«›ûNšÚ—¶à¥H®<P$nh@‹*Ç7‹¾ğrÉ–ö¯ÔSõ“\Ù®^ ‰2ŸZ3HÎÒhÍš²;õİ°\@Lu¨FıÿN¶›5_KÑÌl0»¤v×ğ’$¼š^êÈpcŸœ3¿¼†@â‰f0
xê³·AU2Ñ_‹uTfr;¹ÎŸ…Ôà’÷è‹ÈÈqo!Ö]ª/ hœû2Ùë6ßÌÛí3½„–i~ˆp7giA¤-Ps!¥‰Ã±îÿPkó~Ë»¦¬˜ÒÛ+é¾¿/÷ĞH8w˜òÆ×’{‰ª%±HqakÜû4Æû†K+ÀU§^»Ù‹[qY#{5vGà0:PÏƒ». ¬wÏ ‰w÷œçªËá0q×êkı÷j…³+æG÷l‚ğ[&}ºÕ'¤`YÅ3éƒ“ì'ÚÉ½\İ_£`ÁäMó%ü…íøºR$ºv¸æ_é?õğ5$.JõôÓIiX¯ä…‚1/&c!²@Lrû·f|üCŞT‚êÿ	\F:K–¦±òÅ±!ú!ßr#W–ÜgoøpÄÇğÚMÛªt›òÀÚ’<H—„ßä_tUå§éäÒ0?Úâ´æ¤ºãeñWã<· w‹Ú·-I‚²Uù{v¡ÿCÓx\–×§wå0ü%óÙ6ßÎ¶÷D¿°kö+Tú¢ìQ±7&º»CÚô²¶$ˆÄl±j£!ş¤Oalú­ òŞ‘U5™§ ¼lbS6ñx¿“Ğzøãn‰
’–ñÖ%z1â£Î‰ÆeûÎi½3ièÍûÿGi—"8h°h^…|2‹=4ºV!eUİ†\ hì4ñBf§ªÎ‹¢¨§‡‚ã¥"Üs’ìo½Šïµ®œûq† =u7E$P0ê`]´‹.˜:ÌS_¡^j‹ívÆzÑ"iŒ·ÀĞ~8ƒ‹B³ş®ÅÃ‹Ş9%<XRG3Š8†Ğ­rìcñÏb30’7*ˆ#²`%½â´”M¶¤Äl#Pî¼¸$F¶eZ5¶yÖçîo3÷66qõl3sÔ"¶$(ûà<!z«û¯,B*d$¯ßşX;}—JÔ »Xv£uw}p¾TÄAR"E^´‰®³¥P2X%#–@R¼ë‰¨í,]lƒ‰5:f3u|"´¤ãİÙë/M¿Y †XÏ“ÂäÇÊ€‹î˜m±YºÎĞñ¾QøKıÜK·ş¢¸ ‘:ª»bTÜm„ÛW´ÌQìWş„%ügËöç¶G|‡’í?VsŸúdUêùZ*÷Ú1IĞğÍª úãR²òi[ú°)‹	Ö¨!@æ»¦À¼¡ƒœ´~´:ÚŒ"\Ê'¯©B7éûâWrm„qB-?l	êĞìdTTË&3ˆÔ=Ès;=ğ~?â˜_0 v.4Dµ*ä†Jc¾WÂ4]54èÈ»şÊÖægÂ‹éoÇMó5$¶4l;¶U_·$™Õ[/ñ´5—5|x@}’Y–ì2ç’Añ÷%­y£qƒe¸éI÷‰aI›I@¿'åe	*hFé$M: ´_ĞŞTû9K”¸¤%ŞßÆ‰À™}‹F}ú+Ç!ßŠÓY“}Íå.£Zk”Yâ6N¬©¯X†ğç]'Wà¡fŠ¾Dµ2ˆékÏ§ûÚ°¿}õ¾>~MJ¢<w¦hÔÃ2º¿è›ÙøRìN‰õÂàsjÂ'- „%%QÚ;ıv%ÇÒ–
ƒ_zöQ7‘„«Ïf3½Š–¨û)«/GìùÇÿTÌû ë´x\+œ#ayDH#ˆAo°ê)ÛËõCİK#œL#!(:…¯¬9#u€ÒiJÒìn„C£o¶dlLÍ:ùçZªšh”
å•ØObCòTœÁèv3µ¤˜TUWB™&[’o0tç¨õqöµ‚ØÒ1ó”O’|WW— \¾ÿ-Ùq9YÛ ÊR1R=ÍZïÆI
NmCb¨N³`Ì?zK…h+<Bğ4Hª]5n:(­üã¦á KWK3Àœâ}í€EDVUòÏ£™!{¼²2õ´Ñ=ÀÏµ&°’Â.ó¤‡Š¦DyfäŸYv¹œ,²¡`%ôµIŸRLCá¨ø¤ß9L!¾ÍÏåç]2,ÒƒÇâ>‡©c±>Ù£±}–J‘w÷±7u—³|û~Sku×Û‚—öØY{ˆÒqù«öièÊó/y†E$M†QS\4ÌC[”<»¿`‰T p[BXšxËŒlú•âÇ†3eSEãdv¸ùPn¤®¡(UT“¡W
c|Ê¡pZdœÄ‹ß*„Ï·ÔÀÖè°gëù¼£Ğ3×E+ìˆBÀ»Ñ\¦LÂğz†¡;úÛ¸øãß[y!”¹!ğä8lãlƒÉ­+LDe7bŸDD İÒğ|X?Næ¯‚².;•ú’<ÄJNôéö¢,Ã ½!£nÍEK^ün;à´5†(ÔM¤7oÔ´8OŸ¹LØÈ@5¥'/ŠçÆŸÊv»gB‡y}u2 ê(í¨)
ìÖ‚QlA’—”13a¨ËÚ«ŒíL²9Hg¥p#¥`„eG‚×Éøí_¼í«h¥q†‚|€â2ÊüÃ¯êİÙò‰$ÜùWŠ¤´KCÔf„;7dD…Jbyìşøb
Ÿ}úßŠºhÃ\q‹‰ö'ıS–¬ŒCŸÊ6«¶WÆó”á+XÊyL©@½¬	sR°àÑÕ¤ÍÚíµ¡)=bXÁñ6M;™k­W	êµj._„ÎX\Dğ¸!_·‰>Ì|¥AT‹p¢06„™³ÑIµ}/§Q‰¡æ–¯J<{Íîô ÀXY™&•ĞşlØ:KsÖ> R¨)SJÿrŠp8¸X÷Ö¶ñä¬¢z”Ğ´ú`øPAÍ#:¨¯‹/âİ<åÜ¸üÚUkƒ 2
Né;òn!‰<V¦ * ßh"˜†‹T¸n±G°güŸ$ğ/t5ğ—öèp³g±ä¤=nø>Í¶b-(‰–ª>SÍö=lFÁ<@Èùó±³Şø½ÅŸ½ñV_åÆF›f@ë¾Ğ.†ïÔGÓ4Nkw¾±n}ï+³24zÙ¯¸âXÎÍ@•fşá%-úZ%[–èSß86´b­Ù8…¯Ğ3?fÚá=^Û\E©|#vâÆĞoá©g´¶d?û:´A‡@mñ&:@‚Îõ)&d°®ƒ‰¼x·B¹ïôhˆDëä,‹b¬ËEÂ°6s¬4fy|‚M^{”úÇ*—0 ·rF!”Qj"Äiİ‘±/
Õ#ñ®¦Q´)—,+ı¥ëïj5Ü­¾m+fÂ!¨‰v¯ËS_¢–$œØ«Şr­V§¯8çXøˆ*Ñ{‹Ç^{³cÒÂ¢tÆ"¹p´óC#/TªÀfÃw#2ñBo›Ï9©è&„“ıe[ ØĞL®+¥<ù;Çû=Ë<äXÿ<ÁÉÌ@@%r„.t–¼›J¯iÜ
aAïÿ²Ê+JÓ³^™ÙuyñÀ ö¤ìbğKù‰å x‡–9Kc,Ó'Oib¥Šß9·];)¡—DD
ÍÚ¤µ $^	çiŠHã82Àw9­'ÎÎ&ÛÖÿ“èàT»Ùrh! ÃêT¹~W­·Ëša,ıfBµi	g:Ã›Ãº*ÇN@]B“é*´Ğ›Ğ(“~[G ¤ïˆò®T_OË ¯	9“VMÌë-³ç€e "îúˆê›«…qÎüİï^‘‡HºUúéÅxceeding
 * @returns {Edges}
 */
M.checkWithinContainer = function (container, bounding, offset) {
  var edges = {
    top: false,
    right: false,
    bottom: false,
    left: false
  };

  var containerRect = container.getBoundingClientRect();
  // If body element is smaller than viewport, use viewport height instead.
  var containerBottom = container === document.body ? Math.max(containerRect.bottom, window.innerHeight) : containerRect.bottom;

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledY = bounding.top - scrollTop;

  // Check for container and viewport for each edge
  if (scrolledX < containerRect.left + offset || scrolledX < offset) {
    edges.left = true;
  }

  if (scrolledX + bounding.width > containerRect.right - offset || scrolledX + bounding.width > window.innerWidth - offset) {
    edges.right = true;
  }

  if (scrolledY < containerRect.top + offset || scrolledY < offset) {
    edges.top = true;
  }

  if (scrolledY + bounding.height > containerBottom - offset || scrolledY + bounding.height > window.innerHeight - offset) {
    edges.bottom = true;
  }

  return edges;
};

M.checkPossibleAlignments = function (el, container, bounding, offset) {
  var canAlign = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    spaceOnTop: null,
    spaceOnRight: null,
    spaceOnBottom: null,
    spaceOnLeft: null
  };

  var containerAllowsOverflow = getComputedStyle(container).overflow === 'visible';
  var containerRect = container.getBoundingClientRect();
  var containerHeight = Math.min(containerRect.height, window.innerHeight);
  var containerWidth = Math.min(containerRect.width, window.innerWidth);
  var elOffsetRect = el.getBoundingClientRect();

  var scrollLeft = container.scrollLeft;
  var scrollTop = container.scrollTop;

  var scrolledX = bounding.left - scrollLeft;
  var scrolledYTopEdge = bounding.top - scrollTop;
  var scrolledYBottomEdge = bounding.top + elOffsetRect.height - scrollTop;

  // Check for container and viewport for left
  canAlign.spaceOnRight = !containerAllowsOverflow ? containerWidth - (scrolledX + bounding.width) : window.innerWidth - (elOffsetRect.left + bounding.width);
  if (canAlign.spaceOnRight < 0) {
    canAlign.left = false;
  }

  // Check for container and viewport for Right
  canAlign.spaceOnLeft = !containerAllowsOverflow ? scrolledX - bounding.width + elOffsetRect.width : elOffsetRect.right - bounding.width;
  if (canAlign.spaceOnLeft < 0) {
    canAlign.right = false;
  }

  // Check for container and viewport for Top
  canAlign.spaceOnBottom = !containerAllowsOverflow ? containerHeight - (scrolledYTopEdge + bounding.height + offset) : window.innerHeight - (elOffsetRect.top + bounding.height + offset);
  if (canAlign.spaceOnBottom < 0) {
    canAlign.top = false;
  }

  // Check for container and viewport for Bottom
  canAlign.spaceOnTop = !containerAllowsOverflow ? scrolledYBottomEdge - (bounding.height - offset) : elOffsetRect.bottom - (bounding.height + offset);
  if (canAlign.spaceOnTop < 0) {
    canAlign.bottom = false;
  }

  return canAlign;
};

M.getOverflowParent = function (element) {
  if (element == null) {
    return null;
  }

  if (element === document.body || getComputedStyle(element).overflow !== 'visible') {
    return element;
  }

  return M.getOverflowParent(element.parentElement);
};

/**
 * Gets id of component from a trigger
 * @param {Element} trigger  trigger
 * @returns {string}
 */
M.getIdFromTrigger = function (trigger) {
  var id = trigger.getAttribute('data-target');
  if (!id) {
    id = trigger.getAttribute('href');
    if (id) {
      id = id.slice(1);
    } else {
      id = '';
    }
  }
  return id;
};

/**
 * Multi browser support for document scroll top
 * @returns {Number}
 */
M.getDocumentScrollTop = function () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

/**
 * Multi browser support for document scroll left
 * @returns {Number}
 */
M.getDocumentScrollLeft = function () {
  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
};

/**
 * @typedef {Object} Edges
 * @property {Boolean} top  If the top edge was exceeded
 * @property {Boolean} right  If the right edge was exceeded
 * @property {Boolean} bottom  If the bottom edge was exceeded
 * @property {Boolean} left  If the left edge was exceeded
 */

/**
 * @typedef {Object} Bounding
 * @property {Number} left  left offset coordinate
 * @property {Number} top  top offset coordinate
 * @property {Number} width
 * @property {Number} height
 */

/**
 * Get time in ms
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @type {function}
 * @return {number}
 */
var getTime = Date.now || function () {
  return new Date().getTime();
};

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 * @license https://raw.github.com/jashkenas/underscore/master/LICENSE
 * @param {function} func
 * @param {number} wait
 * @param {Object=} options
 * @returns {Function}
 */
M.throttle = function (func, wait, options) {
  var context = void 0,
      args = void 0,
      result = void 0;
  var timeout = null;
  var previous = 0;
  options || (options = {});
  var later = function () {
    previous = options.leading === false ? 0 : getTime();
    timeout = null;
    result = func.apply(context, args);
    context = args = null;
  };
  return function () {
    var now = getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
      context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};
; /*
  v2.2.0
  2017 Julian Garnier
  Released under the MIT license
  */
var $jscomp = { scope: {} };$jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (e, r, p) {
  if (p.get || p.set) throw new TypeError("ES3 does not support getters and setters.");e != Array.prototype && e != Object.prototype && (e[r] = p.value);
};$jscomp.getGlobal = function (e) {
  return "undefined" != typeof window && window === e ? e : "undefined" != typeof global && null != global ? global : e;
};$jscomp.global = $jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};$jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};$jscomp.symbolCounter_ = 0;$jscomp.Symbol = function (e) {
  return $jscomp.SYMBOL_PREFIX + (e || "") + $jscomp.symbolCounter_++;
};
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();var e = $jscomp.global.Symbol.iterator;e || (e = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));"function" != typeof Array.prototype[e] && $jscomp.defineProperty(Array.prototype, e, { configurable: !0, writable: !0, value: function () {
      return $jscomp.arrayIterator(this);
    } });$jscomp.initSymbolIterator = function () {};
};$jscomp.arrayIterator = function (e) {
  var r = 0;return $jscomp.iteratorPrototype(function () {
    return r < e.length ? { done: !1, value: e[r++] } : { done: !0 };
  });
};
$jscomp.iteratorPrototype = function (e) {
  $jscomp.initSymbolIterator();e = { next: e };e[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };return e;
};$jscomp.array = $jscomp.array || {};$jscomp.iteratorFromArray = function (e, r) {
  $jscomp.initSymbolIterator();e instanceof String && (e += "");var p = 0,
      m = { next: function () {
      if (p < e.length) {
        var u = p++;return { value: r(u, e[u]), done: !1 };
      }m.next = function () {
        return { done: !0, value: void 0 };
      };return m.next();
    } };m[Symbol.iterator] = function () {
    return m;
  };return m;
};
$jscomp.polyfill = function (e, r, p, m) {
  if (r) {
    p = $jscomp.global;e = e.split(".");for (m = 0; m < e.length - 1; m++) {
      var u = e[m];u in p || (p[u] = {});p = p[u];
    }e = e[e.length - 1];m = p[e];r = r(m);r != m && null != r && $jscomp.defineProperty(p, e, { configurable: !0, writable: !0, value: r });
  }
};$jscomp.polyfill("Array.prototype.keys", function (e) {
  return e ? e : function () {
    return $jscomp.iteratorFromArray(this, function (e) {
      return e;
    });
  };
}, "es6-impl", "es3");var $jscomp$this = this;
(function (r) {
  M.anime = r();
})(function () {
  function e(a) {
    if (!h.col(a)) try {
      return document.querySelectorAll(a);
    } catch (c) {}
  }function r(a, c) {
    for (var d = a.length, b = 2 <= arguments.length ? arguments[1] : void 0, f = [], n = 0; n < d; n++) {
      if (n in a) {
        var k = a[n];c.call(b, k, n, a) && f.push(k);
      }
    }return f;
  }function p(a) {
    return a.reduce(function (a, d) {
      return a.concat(h.arr(d) ? p(d) : d);
    }, []);
  }function m(a) {
    if (h.arr(a)) return a;
    h.str(a) && (a = e(a) || a);return a instanceof NodeList || a instanceof HTMLCollection ? [].slice.call(a) : [a];
  }function u(a, c) {
    return a.some(function (a) {
      return a === c;
    });
  }function C(a) {
    var c = {},
        d;for (d in a) {
      c[d] = a[d];
    }return c;
  }function D(a, c) {
    var d = C(a),
        b;for (b in a) {
      d[b] = c.hasOwnProperty(b) ? c[b] : a[b];
    }return d;
  }function z(a, c) {
    var d = C(a),
        b;for (b in c) {
      d[b] = h.und(a[b]) ? c[b] : a[b];
    }return d;
  }function T(a) {
    a = a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (a, c, d, k) {
      return c + c + d + d + k + k;
    });var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
    a = parseInt(c[1], 16);var d = parseInt(c[2], 16),
        c = parseInt(c[3], 16);return "rgba(" + a + "," + d + "," + c + ",1)";
  }function U(a) {
    function c(a, c, b) {
      0 > b && (b += 1);1 < b && --b;return b < 1 / 6 ? a + 6 * (c - a) * b : .5 > b ? c : b < 2 / 3 ? a + (c - a) * (2 / 3 - b) * 6 : a;
    }var d = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(a);a = parseInt(d[1]) / 360;var b = parseInt(d[2]) / 100,
        f = parseInt(d[3]) / 100,
        d = d[4] || 1;if (0 == b) f = b = a = f;else {
      var n = .5 > f ? f * (1 + b) : f + b - f * b,
          k = 2 * f - n,
          f = c(k, n, a + 1 / 3),
          b = c(k, n, a);a = c(k, n, a - 1 / 3);
    }return "rgba(" + 255 * f + "," + 255 * b + "," + 255 * a + "," + d + ")";
  }function y(a) {
    if (a = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(a)) return a[2];
  }function V(a) {
    if (-1 < a.indexOf("translate") || "perspective" === a) return "px";if (-1 < a.indexOf("rotate") || -1 < a.indexOf("skew")) return "deg";
  }function I(a, c) {
    return h.fnc(a) ? a(c.target, c.id, c.total) : a;
  }function E(a, c) {
    if (c in a.style) return getComputedStyle(a).getPropertyValue(c.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()) || "0";
  }function J(a, c) {
    if (h.dom(a) && u(W, c)) return "transform";if (h.dom(a) && (a.getAttribute(c) || h.svg(a) && a[c])) return "attribute";if (h.dom(a) && "transform" !== c && E(a, c)) return "css";if (null != a[c]) return "object";
  }function X(a, c) {
    var d = V(c),
        d = -1 < c.indexOf("scale") ? 1 : 0 + d;a = a.style.transform;if (!a) return d;for (var b = [], f = [], n = [], k = /(\w+)\((.+?)\)/g; b = k.exec(a);) {
      f.push(b[1]), n.push(b[2]);
    }a = r(n, function (a, b) {
      return f[b] === c;
    });return a.length ? a[0] : d;
  }function K(a, c) {
    switch (J(a, c)) {case "transform":
        return X(a, c);case "c}ób]&¹Bc´A0OXZ-¤6Õ’âY†Íùãµ?ü°b‹å¯!éXÄ.uºM£ÊÑÌJ&·€S˜HÁçˆoRÅşˆTÕb¢-RC¤øé®O!néÃÆö­DuÅ+‡É1a—>#Ò¦<äÙõMùä8‰E×&Œô=”Õ+²I[kóBØ÷	¢GñôAÔäz4á[(‘ÚF8Œqí²‹R[Ş#¹‹`‚¦[¸ÀÄå;öÃ÷ÁÌˆş«}x>)­ŒZm§ö’Wt÷nıË°š¡¹³N5àÄyçû-ğÑOqhŞ_Ëº2d0DvªÃÌ8p*ÔÒ]3÷¸¸şŞÎ}ûy4µrŞØ‘”BÃj!bı¶ÿ^%1íW±Z/«ÊQóòÊ)Èn½‡)ñ5¸ÃƒÛµ²‹ÎuXA¶2¼»Ó)ËJì4ƒ)"…†mˆm)%È¥Î†¤É3¸kI`íp•¯ok8à¢*0r»ˆİèœiç²¢{ı iÑ—mÙîÿ\D§¹s9¹#ËêQ¼@(Ø2ûä‡u!²Û–¾†UK=Ô·ï=	†œĞìgALëy¬…Ç©]yuÛqóp"YÏx©Ë¼•4‚×/{Xvy{^GÃÁ®Féoë8p†aïtÚ²1cÑÎÌ†ıìñ”–W() ›éø£ æÇÅ•.ë’"ı <ÆéØCh)«@äé¾ÂˆÔ?}9d@2MáÔ@a© ’òÌ¾RZ$l¬lñˆ6Ò™ì&NãUAxZT:¸y3¹¹&1µPPFsˆÖÑêÒ}iÛÖfœ}İû3¾q'Ä.¬váqW’ÖÜÊ!áLÏä;E	Şéûµ9õw66oØíŞº9UH´E3³şç*ÌâÒ»¤Y¥x¬lìî$„$ ˆßû”xäf¤ò-Ã¦ÙMaÆ’&4­m¸·˜K«›‚²e“—öò‚ùÁšŞˆr—\¹YtÆVá÷wN»j
İ¯Èi=ºÀ{ìn ¨Ãy¨÷ÈÑ¡¬\¡ºĞş$ØlE}`^àc_1j=:HlºõÌßµkY;Oèúfröù 3—2j*€Eş /OUªÀŒpríÙdÒµ8¢>±¥3eA¶öƒ!j¾ÂıµU¥½”_·’íZ² ñè²*œ5Xº¶?PjO·%sz)°|«òRÃ­ÖJ«=~û/æığ×8(`ˆÃf=±ÿoÙ• ½ı5tDL XûK^C»°A<šíïõ;®‰¹¶ûKÎ8şĞú#Ë|ò¤è©œ½«rÍ"ñf7“YÔdl#™mbÔjŸBE_Øtµ˜‰úA6“\‘Á‡‹Ítû¨³÷+Ãg	n$î€—Éá®V<ö·ebá*>Ùpş8/®ÉÎFl$Š2o1æR‹!ñ2µ' ¦¹ójf°1˜§ÈèÈ”Ù$¢¤h¢«u«B„ûÄ§"¢|iß?Aíÿ³‘ùdˆ›üÛu¸¢÷^F˜BxÄ‹bÈµ W+Ã7×àpãêIaQ*¨gûßoè	ÄRÛ—õb6%ÍLí!}q„·•¼ç×
´ä¦cE-²›;Ã™âxÁLäN‰/šmE ¹ûoŒuòšFö
Îßëıß!PÙ~j|†ºu­"¶¶Æåg´æFumA+wD­~gm»ü ákc mMÌ( Æ‡j1qHR“˜³ûDÄxV‚h"OÏPÕ@;ùt!+3è]É³Œ¦ËVA yûIÈ‡#÷ë`U­6N)ÑÃ+‚ƒˆ\½@cä±y>õjs<ÚËJ¹RQxX•¾dyµÕ¦©’#›~- ¤°ò“Òaß}9iıÙ·ìwALª ‡gåÈÅœïæoQZĞÇE+ï-ßŒ^è
Òà'Ñˆ»÷°²üÚ}<¦h:7äWÚÑäâMDò×Ï¤aØµ(Cºup&XŸÜC¥GÓ/Ğ™î`åÃİ>)°şÓn½{&¾P‚FÀ¶è¾lÂáôôVA*å1Ó[ü+å©°FŞˆ¾GùCVRmófL“ï	gª®r}Ÿñ°ÚŸo™fÒ{óë¦sPhiÆ ˆĞ•l`>O’öÖo)Òû~IäwÀ×İyÅÁcaä£#¿ã¦šHßr'Û@©éä8½6Ñ3.©˜£!£l4-ÁRôÆ•Š‡o&4ıË2ßEÇfG>ÈEøàˆ2Áj6ØiÑG"ÎWÈ;#{i#ŸMHM£îÖ©wÄ°~.Ğ©
v ´Â¦aWYßWOğ;WÒSNäãú%%hjNG`SèÁÉÇÅ…ˆkö;üáâZéÆ86'âR
Ù3áˆ1-ºrQaR%sı×©ò{?ª¢\º”cÚˆ¥IV¸¬´/ĞysvÙÒüwb8˜3'Tï*Ç$_AI³ªCƒcwµ‰ÒVh¼‘¥ßoŠò•8#.>/í{£I3œÊˆÀöqf’‹„Ğº˜@#ı:³ca&£"ö64è£ö
‹9é‹0Ê¿üI›5–ì½{‘-VÄLiM´ªR$B^ïu»2ˆØ­ÀĞŒº3‚ˆ÷ÛÀ±½Ì\kq[TaûeÆıÖ^9
TöÔ®%$˜¬G}EF¤_ß5RL£Ì‚ë^ °>¨œşÁğ­xÇKfH¥­çöŞ#wx%İÓ¯Ht¦«Víªø`­'Zß]Fœ”î¦÷®lœî±~ùjW0`í°8òôéãÀvôX.¨Sª¬ÌºSRšCJ§Ë½;B²±+ÑÓ Ë¹õ ì¾c•ª´Ún—¸R“Ú?uˆáB?\?Siuí[oS73×Çé¼`Åøë`­ÿÍ¾?#ìoCª~ˆa¤Œ¨Hx2~Ş¨¡¼úx£‚Êâne´õ†.òî9:écï.’èÄ©3µÏNá‘ÄÆ_ô:ò±iyZ©×êŞ
#+\€œ1İ7ˆ—ıó”V‡…€Ë}eàõguT®¿€<4e©r)ÊcüS¥Ëó¹A>p½/¸EÊÜWšSyûDohl“íÀ}<Rêœiì”¥ã
¤ñRu O•k=^-Š69µg†÷É§ÓÜ«„Ö¯:t¨4¿ã~K'¼é “ñaLñlş~Ù¿Á¬§,ËKÌÚEEùgŸdìJç£y}ƒxUCòy_hŒüÎåú,˜èVÊ5$‰J;|„X; ¾ÏÀ©äğ„"ÂI³L¥—$Øÿ GôS/éÙv¢-7@6qñ˜û-X]Ò7'6HS‹I ù@L÷ösÄk@«‹mq7JMUX%iÀ››@Ï(Üµğ?wBçéïÑEWü) øxÁxöYÅÙ_· ø•Cı¤ùk³Š…¼o•Á]…ej¬IÇ¹.†yØ(ÆèB OïÙë9‡hå÷,óë
‹UqF÷u´9,êÛÛ?Ê]PÔ„2Õéd`}Í	ËúiÊÂ¹&¦<Z$ÓìÍF5Ï0ğhJ_®YµRıÖã–I8³óÙŞVŸ×y½µKvÖ¡¯LŠôn·0%p'…e÷›Ùã ÷û—¸Â=¤½ß«'.¹š‰IdúßÔªe»ûâG¡: §›Ù;(âL£Ø‡«İŠ“©F³;´Áé¹º´Ç0T™Sõm€èAŒ’¹AfÍL	:<HVf·HdŞ·‡z‹ÀÏÔC(gXT~`d1E4‹XNˆ4<VÖØ>s¯àx8¬HAVö@:Gºç€TíÂĞäÓ§S›Ã«=Dãëú7•x¢dEŸDùïNE·fp#=/ÅŸûÔY,)sO	Àä0Œ8§·*i¬v¶šïçcÒäé,2@\1³‚8'©‡jª	L‡ZQÜ5Á	¯Š¸2ŸANú[¡»Ğ%>ÇaÚ-¦«G§mïh¥¢vL[oó°¯½àÕÅ‰µ :Ã¡¬ã,ù>s»Î—‚*
ú€ÛìÍà…¯œ·=e~‚· ußN¤V²hæÆú´—Ì:‡›-B½uû«k4¹Îb‰Re'­OË‡–ZcYBq¿Fê–BlR(¬DÜêšø‚-3"¶˜(ä¯.ˆûEş®f\ “ÛËzFÜ]¬iHò v™£xÏ²·.ÈAKs„…ÎsÍ?ˆ»§ß)O”Cç°Æv ËNÄ(W9Ş-{ö1yä‰3V¡ÉõÆ4¾t+&K2%¬œñËÍÒ§8-ˆagYª=yñ×«š/Ë“ğ4ô˜8}Ôş\IJãU4*\€’àaÃO|“ç€ï‹„B™W„§ø—¢	4úæ­È“»d=ÛKµ0ŒsjíIïª¿¼J2‡÷>üzÕ·*]âáäi.c:Í?%eO%jaÈ)Üèß©°ƒ¢Ÿ@âÈ'BŞ#$¨Ó®ÿ‚Y¿ÒÅ©|byŞ±úqÇÑİ`R@Ë…i¹>Dy)FÖÍT‰³Wù©€Ë[Íñh¤{Y˜¡£"ßq2K$Á‹ÕŒGÜqàğç^ueBøş…™İ¶á­‹/ C=I;ìù”ÜÔeœd+óÀDıÂm__ùäÖÉ1]Pƒ1²! ÆÁ2jÔ»FÍVõ% ãÁìn¿j²§ji	~¸éu&„÷)âO«¤ŒQ®ô	ô}ö(”ÃÑê® ÚÜ‹Ö+;w“¹­¯¼1Blİ˜…b¶ÉÛıaTzµ¥ÊÍğûá¤–µ;½™À²õ9½­•0õşIr£ŞŞ•ÖÀ=Tµ§–DwB–R¡™ÎD˜¢5ìDÑ“g¼³DäÉPzô‡Cfßéhá³Eñê;¨[êB]Ù5‰Xqêú¯0³SäíFDÃvçj%nguh©íİË{åqYğãô6!±hX÷5âGØã(ßâñÖ2ğdÍfGwÄ×ıU \]EªTI«™×4&ÎâW<D`ª0úµ+—ƒõµWK^ùı~%
…{çªñ¨e¸’XÂíŞÎ”w²L§grâ®ä¶ƒ†‚€”£û/‹>2ÆÏ„ÿ={Zwd¡cbA°ûõHdÂY™şèÒQÔèılv¡ÅgÚ‘pAÜOáÄÍ¢ó8Á!ê 6lM)»(xzÁàªÄÜs±¡SuÖ6=´'Ô›Ğ¶ŞÛ˜ò!ZÒ\ÊÒáşÇßÀ§]ã—Ô¢B‘IL‚›Â4¿%=§Dñ4N_]6áü}eùïÎzÍÖş<³xš‰í"„•ï8]ù€²¹Jué¥Œ#?ÄHFv²–yU^†³S.†ó«TÈŠ-22ş*õø»|Ğsw¢Ææ[À‰Ê8~)Uğ¡âqEÉºş@eÔ
3œ%	æh”$K»TÚÛş–Š©N)m67ß/‘)à“Š(¸„Ï¸›Û»Q:|MÄ¶©Œg¦‘jÉ c.map(function (b) {
      return b[a];
    })) : f ? b.delay : d.offset + b.delay + b.duration;
  }function fa(a) {
    var c = D(ga, a),
        d = D(S, a),
        b = Z(a.targets),
        f = [],
        e = z(c, d),
        k;for (k in a) {
      e.hasOwnProperty(k) || "targets" === k || f.push({ name: k, offset: e.offset, tweens: aa(a[k], d) });
    }a = ea(b, f);return z(c, { children: [], animatables: b, animations: a, duration: R("duration", a, c, d), delay: R("delay", a, c, d) });
  }function q(a) {
    function c() {
      return window.Promise && new Promise(function (a) {
        return p = a;
      });
    }function d(a) {
      return g.reversed ? g.duration - a : a;
    }function b(a) {
      for (var b = 0, c = {}, d = g.animations, f = d.length; b < f;) {
        var e = d[b],
            k = e.animatable,
            h = e.tweens,
            n = h.length - 1,
            l = h[n];n && (l = r(h, function (b) {
          return a < b.end;
        })[0] || l);for (var h = Math.min(Math.max(a - l.start - l.delay, 0), l.duration) / l.duration, w = isNaN(h) ? 1 : l.easing(h, l.elasticity), h = l.to.strings, p = l.round, n = [], m = void 0, m = l.to.numbers.length, t = 0; t < m; t++) {
          var x = void 0,
              x = l.to.numbers[t],
              q = l.from.numbers[t],
              x = l.isPath ? Y(l.value, w * x) : q + w * (x - q);p && (l.isColor && 2 < t || (x = Math.round(x * p) / p));n.push(x);
        }if (l = h.length) for (m = h[0], w = 0; w < l; w++) {
          p = h[w + 1], t = n[w], isNaN(t) || (m = p ? m + (t + p) : m + (t + " "));
        } else m = n[0];ha[e.type](k.target, e.property, m, c, k.id);e.currentValue = m;b++;
      }if (b = Object.keys(c).length) for (d = 0; d < b; d++) {
        H || (H = E(document.body, "transform") ? "transform" : "-webkit-transform"), g.animatables[d].target.style[H] = c[d].join(" ");
      }g.currentTime = a;g.progress = a / g.duration * 100;
    }function f(a) {
      if (g[a]) g[a](g);
    }function e() {
      g.remaining && !0 !== g.remaining && g.remaining--;
    }function k(a) {
      var k = g.duration,
          n = g.offset,
          w = n + g.delay,
          r = g.currentTime,
          x = g.reversed,
          q = d(a);if (g.children.length) {
        var u = g.children,
            v = u.length;
        if (q >= g.currentTime) for (var G = 0; G < v; G++) {
          u[G].seek(q);
        } else for (; v--;) {
          u[v].seek(q);
        }
      }if (q >= w || !k) g.began || (g.began = !0, f("begin")), f("run");if (q > n && q < k) b(q);else if (q <= n && 0 !== r && (b(0), x && e()), q >= k && r !== k || !k) b(k), x || e();f("update");a >= k && (g.remaining ? (t = h, "alternate" === g.direction && (g.reversed = !g.reversed)) : (g.pause(), g.completed || (g.completed = !0, f("complete"), "Promise" in window && (p(), m = c()))), l = 0);
    }a = void 0 === a ? {} : a;var h,
        t,
        l = 0,
        p = null,
        m = c(),
        g = fa(a);g.reset = function () {
      var a = g.direction,
          c = g.loop;g.currentTime = 0;g.progress = 0;g.paused = !0;g.began = !1;g.completed = !1;g.reversed = "reverse" === a;g.remaining = "alternate" === a && 1 === c ? 2 : c;b(0);for (a = g.children.length; a--;) {
        g.children[a].reset();
      }
    };g.tick = function (a) {
      h = a;t || (t = h);k((l + h - t) * q.speed);
    };g.seek = function (a) {
      k(d(a));
    };g.pause = function () {
      var a = v.indexOf(g);-1 < a && v.splice(a, 1);g.paused = !0;
    };g.play = function () {
      g.paused && (g.paused = !1, t = 0, l = d(g.currentTime), v.push(g), B || ia());
    };g.reverse = function () {
      g.reversed = !g.reversed;t = 0;l = d(g.currentTime);
    };g.restart = function () {
      g.pause();
      g.reset();g.play();
    };g.finished = m;g.reset();g.autoplay && g.play();return g;
  }var ga = { update: void 0, begin: void 0, run: void 0, complete: void 0, loop: 1, direction: "normal", autoplay: !0, offset: 0 },
      S = { duration: 1E3, delay: 0, easing: "easeOutElastic", elasticity: 500, round: 0 },
      W = "translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY perspective".split(" "),
      H,
      h = { arr: function (a) {
      return Array.isArray(a);
    }, obj: function (a) {
      return -1 < Object.prototype.toString.call(a).indexOf("Object");
    },
    pth: function (a) {
      return h.obj(a) && a.hasOwnProperty("totalLength");
    }, svg: function (a) {
      return a instanceof SVGElement;
    }, dom: function (a) {
      return a.nodeType || h.svg(a);
    }, str: function (a) {
      return "string" === typeof a;
    }, fnc: function (a) {
      return "function" === typeof a;
    }, und: function (a) {
      return "undefined" === typeof a;
    }, hex: function (a) {
      return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
      );
    }, rgb: function (a) {
      return (/^rgb/.test(a)
      );
    }, hsl: function (a) {
      return (/^hsl/.test(a)
      );
    }, col: function (a) {
      return h.hex(a) || h.rgb(a) || h.hsl(a);
    } },
      A = function () {
    function a(a, d, b) {
      return (((1 - 3 * b + 3 * d) * a + (3 * b - 6 * d)) * a + 3 * d) * a;
    }return function (c, d, b, f) {
      if (0 <= c && 1 >= c && 0 <= b && 1 >= b) {
        var e = new Float32Array(11);if (c !== d || b !== f) for (var k = 0; 11 > k; ++k) {
          e[k] = a(.1 * k, c, b);
        }return function (k) {
          if (c === d && b === f) return k;if (0 === k) return 0;if (1 === k) return 1;for (var h = 0, l = 1; 10 !== l && e[l] <= k; ++l) {
            h += .1;
          }--l;var l = h + (k - e[l]) / (e[l + 1] - e[l]) * .1,
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (.001 <= n) {
            for (h = 0; 4 > h; ++h) {
              n = 3 * (1 - 3 * b + 3 * c) * l * l + 2 * (3 * b - 6 * c) * l + 3 * c;if (0 === n) break;var m = a(l, c, b) - k,
                  l = l - m / n;
            }k = l;
          } else if (0 === n) k = l;else {
            var l = h,
                h = h + .1,
                g = 0;do {
              m = l + (h - l) / 2, n = a(m, c, b) - k, 0 < n ? h = m : l = m;
            } while (1e-7 < Math.abs(n) && 10 > ++g);k = m;
          }return a(k, d, f);
        };
      }
    };
  }(),
      Q = function () {
    function a(a, b) {
      return 0 === a || 1 === a ? a : -Math.pow(2, 10 * (a - 1)) * Math.sin(2 * (a - 1 - b / (2 * Math.PI) * Math.asin(1)) * Math.PI / b);
    }var c = "Quad Cubic Quart Quint Sine Expo Circ Back Elastic".split(" "),
        d = { In: [[.55, .085, .68, .53], [.55, .055, .675, .19], [.895, .03, .685, .22], [.755, .05, .855, .06], [.47, 0, .745, .715], [.95, .05, .795, .035], [.6, .04, .98, .335], [.6, -.28, .735, .045], a], Out: [[.25, .46, .45, .94], [.215, .61, .355, 1], [.165, .84, .44, 1], [.23, 1, .32, 1], [.39, .575, .565, 1], [.19, 1, .22, 1], [.075, .82, .165, 1], [.175, .885, .32, 1.275], function (b, c) {
        return 1 - a(1 - b, c);
      }], InOut: [[.455, .03, .515, .955], [.645, .045, .355, 1], [.77, 0, .175, 1], [.86, 0, .07, 1], [.445, .05, .55, .95], [1, 0, 0, 1], [.785, .135, .15, .86], [.68, -.55, .265, 1.55], function (b, c) {
        return .5 > b ? a(2 * b, c) / 2 : 1 - a(-2 * b + 2, c) / 2;
      }] },
        b = { linear: A(.25, .25, .75, .75) },
        f = {},
        e;for (e in d) {
      f.type = e, d[f.type].forEach(function (a) {
        return function (d, f) {
          b["ease" + a.type + c[f]] = h.fnc(d) ? d : A.apply($jscomp$this, d);
        };
      }(f)), f = { type: f.type };
    }return b;
  }(),
      ha = { css: function (a, c, d) {
      return a.style[c] = d;
    }, attribute: function (a, c, d) {
      return a.setAttribute(c, d);
    }, object: function (a, c, d) {
      return a[c] = d;
    }, transform: function (a, c, d, b, f) {
      b[f] || (b[f] = []);b[f].push(c + "(" + d + ")");
    } },
      v = [],
      B = 0,
      ia = function () {
    function a() {
      B = requestAnimationFrame(c);
    }function c(c) {
      var b = v.length;if (b) {
        for (var d = 0; d < b;) {
          v[d] && v[d].tick(c), d++;
        }a();
      } else cancelAnimationFrame(B), B = 0;
    }return a;
  }();q.version = "2.2.0";q.speed = 1;q.running = v;q.remove = function (a) {
    a = P(a);for (var c = v.length; c--;) {
      for (var d = v[c], b = d.animations, f = b.length; f--;) {
        u(a, b[f].animatable.target) && (b.splice(f, 1), b.length || d.pause());
      }
    }
  };q.getValue = K;q.path = function (a, c) {
    var d = h.str(a) ? e(a)[0] : a,
        b = c || 100;return function (a) {
      return { el: d, property: a, totalLength: N(d) * (b / 100) };
    };
  };q.setDashoffset = function (a) {
    var c = N(a);a.setAttribute("stroke-dasharray", c);return c;
  };q.bezier = A;q.easings = Q;q.timeline = function (a) {
    var c = q(a);c.pause();c.duration = 0;c.add = function (d) {
      c.children.forEach(function (a) {
        a.began = !0;a.completed = !0;
      });m(d).forEach(function (b) {
        var d = z(b, D(S, a || {}));d.targets = d.targets || a.targets;b = c.duration;var e = d.offset;d.autoplay = !1;d.direction = c.direction;d.offset = h.und(e) ? b : L(e, b);c.began = !0;c.completed = !0;c.seek(d.offset);d = q(d);d.began = !0;d.completed = !0;d.duration > b && (c.duration = d.duration);c.children.push(d);
      });c.seek(0);c.reset();c.autoplay && c.restart();return c;
    };return c;
  };q.random = function (a, c) {
    return Math.floor(Math.random() * (c - a + 1)) + a;
  };return q;
});
;(function ($, anim) {
  'use strict';

  var _defaults = {
    accordion: true,
    onOpenStart: undefined,
    onOpenEnd: undefined,
    onCloseStart: undefined,
    onCloseEnd: undefined,
    inDuration: 300,
    outDuration: 300
  };

  /**
   * @class
   *
   */

  var Collapsible = function (_Component) {
    _inherits(Collapsible, _Component);

    /**
     * Construct Collapsible instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Collapsible(el, options) {
      _classCallCheck(this, Collapsible);

      var _this3 = _possibleConstructorReturn(this, (Collapsible.__proto__ || Object.getPrototypeOf(Collapsible)).call(this, Collapsible, el, options));

      _this3.el.M_Collapsible = _this3;

      /**
       * Options for the collapsible
       * @member Collapsible#options
       * @prop {Boolean} [accordion=false] - Type of the collapsible
       * @prop {Function} onOpenStart - Callback function called before collapsible is opened
       * @prop {Function} onOpenEnd - Callback function called after collapsible is opened
       * @prop {Function} onCloseStart - Callback function called before collapsible is closed
       * @prop {Function} onCloseEnd - Callback function called after collapsible is closed
       * @prop {Number} inDuration - Transition in duration in milliseconds.
       * @prop {Number} outDuration - Transition duration in milliseconds.
       */
      _this3.options = $.extend({}, Collapsible.defaults, options);

      // Setup tab indices
      _this3.$headers = _this3.$el.children('li').children('.collapsible-header');
      _this3.$headers.attr('tabindex', 0);

      _this3._setupEventHandlers();

      // Open first active
      var $activeBodies = _this3.$el.children('li.active').children('.collapsible-body');
      if (_this3.options.accordion) {
        // Handle Accordion
        $activeBodies.first().css('display', 'block');
      } else {
        // Handle Expandables
        $activeBodies.css('display', 'block');
      }
      return _this3;
    }

    _createClass(Collapsible, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Collapsible = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this4 = this;

        this._handleCollapsibleClickBound = this._handleCollapsibleClick.bind(this);
        this._handleCollapsibleKeydownBound = this._handleCollapsibleKeydown.bind(this);
        this.qÄY6î³”MŞ¥‹2İ#"Åc!+ÚÎ²µßNM¡ßä˜ãc^;@²ÁhÉôùÑÛˆ|LaVMù¶Ïª0SLsÌ³=µ‰ªSEğÎ»h}¼,Ë\¦À]“„6#ÎsÂğ¿~¡(í#†ÂLş£{Eü³©E¥+ƒĞpş¦¢Y|°şˆù_IÓK$‡Ë] ™L-§·½mHhõÅ¸ãñHÄdªŞ'†\*¹zëÆÅUm†õ–Â¨÷m7/°™¬`ŠI<·§Òùã—İo²‘n±BÛLâŸ^¿ëÓIî[rp6®ğ­Ÿ3O@7ªd”àŞè{0\zÛ
¡ªØ@N}g¥ƒÍ9xEÒWëùÎ0Â÷·j&¤F:ÕmCSÙ}z|P¾‰(t=i›`=““ì†g#\wËJŒ`ûVİ	û>º–°‹%óËc€ ¤'1½ªF‡*¥bt¤a¥—”G3Ä¯q]7İƒÏy>àÚÙ©8bä5ÜìŸ˜½*ÜÄb™Vz»ªmBo}Èµ8¬Íe‡,•Û—²4ì§QÙÏBŒû(q"Ş;ô ½[hßÓ®k«‚Ê@„ü§¿<4…ÓªÓ h»ôO¨*#ı'ÛÛ7eaÓèÈ'ªÀ´`¼ÿ7z“äs‹ÓÍGÊ¿ÎOd?ìfDI[Ö‘”h‡Õ£¤Ò5„Ò ÓrTÏúŠUøh!€K³ŞënÏ w[<ĞçÁÆ‹\™xzÔ~wìB`/ì§"‚[Ë,„áœĞÑ ËJp¢_>G`wAY&Ñ‰Œ°`KøP|L¾
}¡Y|Òa¨¥”Y0gË`Ø;& ¤§(åYÂ´òæ!í¿Ëéÿ§z"™?]3~"¡mZÕ­·1PƒĞĞ]é{ëƒşğm€ø–Øcw0¹)µ€ˆza¯	Nµ}iı—|-ÙbÙü×DÑYœ{»Ò´æûß…
Å¨½èòB’MHøX!c`>°Dˆ*3‚·9÷ô"Ú/ĞÚYğèÈÆ¼¾.MÑí¸ß°‚û]fr‰‚&}eWºš4\<‘‡’€N9X´áwóMA©ååÆ2tdHƒ×Ä†·-÷œ¿¤§J¤²‡ğP™Kæ.%±ù^kŒ³Pr'¯ÿ$ÜO,íVã’¶«eÚqÌ:4€ğÕ»ÿS
4ë“‰–Ä?ê!TÏ12p¸q»NTÂ=n¢TY³¡¶½t÷ğ#£féàÄ‰fqš4.ÕĞYÓ£!’qL§+İÕ)hÁÿpZ\°ïFAjûk=Öâ	œ~NømÛ;3ñTØûú±-8ìhÔ'ñĞ¤{ĞH¨Ë6lpèÕ¯<åëuM~­yĞ÷Ğt&]ë#u=|?¾%áòßüˆ±“ÍùÅ&1™Êß<’ZĞÇ¨”ğ"µò	\.¥ÒÔ€ÎâW¾Vv	£õü¾İ5nş'M{_²8äÃãsú…åpl‚é}…ËYs¬Wš» ìRXO–èš‚¼õ!¶Â‹‘Â°ú32^OaKìÌV±•Ï÷Ë#ÍÒÉ1”×Ê‘}ŠØˆ›%'%›¡ì¡ådc¾JÎ3(,^¯”Ê¢¤ğ¡‰é»Ş,…ÏÙ˜$DæÛîy*T¹àx¦EêHı~L÷™1¡'%ëš•ƒ7ÙÀGLZİÇ»ÒÑ‚àÂ{*âÆa˜³ÙZÑ:<JÂHdÕ40£Lk}IH”•İ‰KAQc‹NK­[ÄMa‘"D“0Q‘©zn§“.fhõJ¼¤ÇĞ¢œï RóÄ§H/M­¶ë~‚'¤W¬ã*×K³ğÿ'i—d)¹0´ ™&^U` ¶uˆèç*¡”ÄÉÀC½òŸûGNÖ½ÿm–éx8Ÿ{/ …èÔ§)“ÑÌÜ°	İ¬Ô µ1=‡£œèà(Š˜›#—d…9R0Ë§\1’ÃˆÅõ |”B°Ö½·gT;³©°ƒ>¯!×”=: U˜5ueªä!cdA1ÊjÒ–´Y¸n]s+r>’sÖ$y *à¸¥'q™‚MõûRã
p³­"ÖoZìnÖ‹xÁQ	TúZÙ–œMÎ‚rËæŞû<!"~[”›+6ıf'IÀXnYÊiŸo éŠ!òd‹ FŸ,`z~:‚i0¾<’°æY,“ ÎjÁ§/íì†2ßEÓã(	ÈHòn#³Et–Ä[ƒõ0¹C·ô$¼]Qì3›}Ì#üD^òä•¶› ¢ßFÈÿ 
   1fÿ“ğşªD¾FwÏWÿ+¤ÕÑ?|ö÷êê:ùı0_?¦/Õ^ğß>/ŸÑ§êeÿ+£ÿjè“ıT{õuIúºd¾LßªËá~ª|ı] ~¦N|şÿ7¢Ş|ú)ûz«¾®›¯«¦_Ûj€×6àJvÿ*ïz›× v¢@]wŸ„¹.´  û*‚¯\œÀw¾š¬¥QÄ`Wò­ŒÄ§sc#·úÃ¶ºY•8´İßÕmÉ"™œ»^Kq _7KD |Ğ2[/lŒaã()Áz²io‡ìkççò@9^İwx²*×ÈML.ø”WâfVñÅf?ïôÊãahExÏ@G*ß´
ˆ‘ÏÔ#-ÒˆŸµ»úà{˜ˆYAéR~F¤KÖ§Ç{IiFªûÁqª{bÇˆ
‰;¸¹æ]’Íş~NÒ¹9sX²\‰lî9,ºM×>é:¦G#Zµp“KŸP¼*InÕÙ+œp¥`—ji3I:TH²rn­éö­¿¬ˆT:{¶/¥,t#'FP'±Ø–âN?A:1)}
¢Cã dù²Æ³»[ô…Š’pôŞkU¼Ñ°‚š§X‚1ÏßƒqÏ÷ü‡^`tlškâ¢DÑ[a†3ùš¤€º4†¹-ü-=é‡¾ø@5ıoc%73åŠ.ÆœÁ;®$JP%Õh‹ÿGÀÖCMõÕd›ùÙ‹óv—‘ÉĞÌ·ª²M=„â²’<9Ì–v¾P‰hl‚[éÅİ‘z×—‰×µ¤:ˆ{ÇB+ØÕËAª@-%cHÊ>Áuª­OiÎjh˜®ÔÀó3·Põ Â•)Â‡:aõo÷:ä²Y¹y!áÖN?ñ'üSúËæ¤ÇÀMP]8ë€ãÚ Ìï5ˆn†`/]†ÖäŞ’ø‡MàOôàí+»æ?"ğÜÓu:gw…¸»vˆ»ù›™ùÎ„)¾à°ù­E+ÑİÚÒªÚĞâÚ«Ÿ»øc
¤yÄ|>
bjD69ßéÒBÅ¸•‚Š…%ÙY2¸oZ·GÚÁ‹ˆ“G7²[÷€ÂC]r¾Ïá18EgIÛ.“AæÕ¸t$ü—JKi¶,µ²>ÇØ*Æÿyræy,ó(múÓ„tóßÒ•d5¿İ C; †ñ­CSˆrt¾îı¥·"Œı”KU§…¸ØÛ,39 a<ó„"1(î¯Ò,N%[´f—àÂ8ãË0-Ş(qTğpŸ-ôBğŞªú¥ô­¯ŠÖÚz74…èîì¾¨ºFÔ:æì«ÊçØS]»¡iĞŒ§™U½ãqì;ì!úT3áòùòÌU*¯ÅÛŠ"„–2÷L²hoó’ºy¨ø±¥WEÑ¢ˆÄ=Í@®‰€#´“ÇGÌx¡,Dæ%³çËÙÊ©Â±¬üéğ‹.¿œ[Ôq—Î½vhI0ƒ÷Ğ3¼í»Çııh¸™…Æ¿/G8ue“Šİw‘ó›eÑÔÏ%MÃ«kfnpu·?İe¸5¨Ö¡İ1sÙ7o‹îOéÙc‰T-´I£«•å‹3¼Êä³5øuÄÛ˜W¾‘DiF‰N=çÓOFo»:í`1k8oØºèÎ¿ƒñI~û&ŠŸ	¬À!¼Ÿ£Rgˆ+Üb¨ÀÒœ±Sı	Î˜bõäÆ€
áûÔ/
OlqU‘A¤( ÏÙfæu=¿
­mÀ%S‘/Ào™4O1²
H¹a¿”’h9èèe™î‘QèÄû!Ğy¬åàŒ¯‚6ñïäÌ;<rÛÖ´1khËF5	ÁÉÔ¶õñ¿?Yk«G€†©ö¨6V‚¨Æ²^ÑÓä@)ZÛÃµ*À« ­óûX1»^xúæ9Ô0kt7ò s-øéì
Ú@ÂSa”Ò—'^Èdğ®ÜÊ‡?d‚	²ƒÖ¸im¿\3já÷ÛT;#ak¶ğq\”âSØÛ£8Şì|±¾°(×@’yŸ©³š	!f
Ì¹H>TÍfÓs1¿6R–áÆ¤«¬îú7±Ñ31RµÚhÚ©dÉqU/CG~qzÁ{s÷¤¤Xaëï–ö˜»©dşÌsÚE@&57j¶ïi*7¯n‰åÑÂMŸDÜ{Õ$€¼kâR«4¢Á½Év¡*[A‘:2ÈrfßË5½ª±óş$%œj*{˜WÜ±ç_–M	NcM¾-Ã0æÀÃneƒCFæ™übËKÎ×ÅÏ#ã°Ky*'§v0Â$Ûæ[†©~UªV@şó¿*¾%øc*¤YpVÔã5¹"¯TP`¶óa	g¶—4=¿áı_`´cÒ¯HkfBÖFxo@¦,Új_è¤¬;’ò 
Ô>{‘!gvÒ–WHVĞHâ9öÿ8ŠĞ@¼¶+|%î°8ßù¨‹¶Ú„•:ü'…Æ»Ôˆíâ&I¾:T,í°Ù2ÊÍ¦Änç¼½Q¬ÈIìOî3dX!G”ş‡õ~ñÀ0VóÍ›ÜDGHÀ%µœµJÚ.mûW_QšP*N¬(×9FU5}ú	}M“eïW7\îtjä*µ Œ3„+RO’¥?¿bqtõF¤ûzâéŸÙ÷Ş„A³.È¹ŒØ#µ*zî.û1­aÔ‘p	òŸ!×ºör@š<ìŸ6wh¢şíÜƒÁöÃ†¦¿ÕOşI¾q·C¬uúÆÒ,ø‹òŞäºüÉ‘unØ‚òà°OM€N`)ãYr— 2Ghfİ¹@K®Æ+éåí5îoˆ$’½\¿¥¸aqZî¶K7¶c{¡MFµÊPğˆŒå½×Œ±¬	{ ·5¥úÿ,µ$dİ¶eßsWÃÑ«Y¢Êş?#İ¼Ä÷w*¸ÈšÓE[¼sSö«‹O•¼ƒâdÙjBüíì£=ušp8{V#×ƒ®ZşYÖ'9‹ ˆ$Å–r‘°‚bZ:f‰çş¹à(jMóÊ‰Œ˜°…µ¯~(İğF¬–ütäL~oÉÖxdí'=_™°MBİ/&w¤ìîøÙpú&\m°€uaĞØªõs¶ón-%nEÇ´[ñè¥¼¦âºş¶Åj1gò éÕUÉÇŒisplay: ''
              });

              // onCloseEnd callback
              if (typeof _this7.options.onCloseEnd === 'function') {
                _this7.options.onCloseEnd.call(_this7, $collapsibleLi[0]);
              }
            }
          });
        }
      }

      /**
       * Open Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "open",
      value: function open(index) {
        var _this8 = this;

        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && !$collapsibleLi[0].classList.contains('active')) {
          // onOpenStart callback
          if (typeof this.options.onOpenStart === 'function') {
            this.options.onOpenStart.call(this, $collapsibleLi[0]);
          }

          // Handle accordion behavior
          if (this.options.accordion) {
            var $collapsibleLis = this.$el.children('li');
            var $activeLis = this.$el.children('li.active');
            $activeLis.each(function (el) {
              var index = $collapsibleLis.index($(el));
              _this8.close(index);
            });
          }

          // Animate in
          $collapsibleLi[0].classList.add('active');
          this._animateIn(index);
        }
      }

      /**
       * Close Collapsible
       * @param {Number} index - 0th index of slide
       */

    }, {
      key: "close",
      value: function close(index) {
        var $collapsibleLi = this.$el.children('li').eq(index);
        if ($collapsibleLi.length && $collapsibleLi[0].classList.contains('active')) {
          // onCloseStart callback
          if (typeof this.options.onCloseStart === 'function') {
            this.options.onCloseStart.call(this, $collapsibleLi[0]);
          }

          // Animate out
          $collapsibleLi[0].classList.remove('active');
          this._animateOut(index);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Collapsible.__proto__ || Object.getPrototypeOf(Collapsible), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Collapsible;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Collapsible;
  }(Component);

  M.Collapsible = Collapsible;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Collapsible, 'collapsible', 'M_Collapsible');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    alignment: 'left',
    autoFocus: true,
    constrainWidth: true,
    container: null,
    coverTrigger: true,
    closeOnClick: true,
    hover: false,
    inDuration: 150,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onItemClick: null
  };

  /**
   * @class
   */

  var Dropdown = function (_Component2) {
    _inherits(Dropdown, _Component2);

    function Dropdown(el, options) {
      _classCallCheck(this, Dropdown);

      var _this9 = _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).call(this, Dropdown, el, options));

      _this9.el.M_Dropdown = _this9;
      Dropdown._dropdowns.push(_this9);

      _this9.id = M.getIdFromTrigger(el);
      _this9.dropdownEl = document.getElementById(_this9.id);
      _this9.$dropdownEl = $(_this9.dropdownEl);

      /**
       * Options for the dropdown
       * @member Dropdown#options
       * @prop {String} [alignment='left'] - Edge which the dropdown is aligned to
       * @prop {Boolean} [autoFocus=true] - Automatically focus dropdown el for keyboard
       * @prop {Boolean} [constrainWidth=true] - Constrain width to width of the button
       * @prop {Element} container - Container element to attach dropdown to (optional)
       * @prop {Boolean} [coverTrigger=true] - Place dropdown over trigger
       * @prop {Boolean} [closeOnClick=true] - Close on click of dropdown item
       * @prop {Boolean} [hover=false] - Open dropdown on hover
       * @prop {Number} [inDuration=150] - Duration of open animation in ms
       * @prop {Number} [outDuration=250] - Duration of close animation in ms
       * @prop {Function} onOpenStart - Function called when dropdown starts opening
       * @prop {Function} onOpenEnd - Function called when dropdown finishes opening
       * @prop {Function} onCloseStart - Function called when dropdown starts closing
       * @prop {Function} onCloseEnd - Function called when dropdown finishes closing
       */
      _this9.options = $.extend({}, Dropdown.defaults, options);

      /**
       * Describes open/close state of dropdown
       * @type {Boolean}
       */
      _this9.isOpen = false;

      /**
       * Describes if dropdown content is scrollable
       * @type {Boolean}
       */
      _this9.isScrollable = false;

      /**
       * Describes if touch moving on dropdown content
       * @type {Boolean}
       */
      _this9.isTouchMoving = false;

      _this9.focusedIndex = -1;
      _this9.filterQuery = [];

      // Move dropdown-content after dropdown-trigger
      if (!!_this9.options.container) {
        $(_this9.options.container).append(_this9.dropdownEl);
      } else {
        _this9.$el.after(_this9.dropdownEl);
      }

      _this9._makeDropdownFocusable();
      _this9._resetFilterQueryBound = _this9._resetFilterQuery.bind(_this9);
      _this9._handleDocumentClickBound = _this9._handleDocumentClick.bind(_this9);
      _this9._handleDocumentTouchmoveBound = _this9._handleDocumentTouchmove.bind(_this9);
      _this9._handleDropdownClickBound = _this9._handleDropdownClick.bind(_this9);
      _this9._handleDropdownKeydownBound = _this9._handleDropdownKeydown.bind(_this9);
      _this9._handleTriggerKeydownBound = _this9._handleTriggerKeydown.bind(_this9);
      _this9._setupEventHandlers();
      return _this9;
    }

    _createClass(Dropdown, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._resetDropdownStyles();
        this._removeEventHandlers();
        Dropdown._dropdowns.splice(Dropdown._dropdowns.indexOf(this), 1);
        this.el.M_Dropdown = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        // Trigger keydown handler
        this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

        // Item click handler
        this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

        // Hover event handlers
        if (this.options.hover) {
          this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
          this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
          this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
          this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

          // Click event handlers
        } else {
          this._handleClickBound = this._handleClick.bind(this);
          this.el.addEventListener('click', this._handleClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('keydown', this._handleTriggerKeydownBound);
        this.dropdownEl.removeEventListener('click', this._handleDropdownClickBound);

        if (this.options.hover) {
          this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
          this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
          this.dropdownEl.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        } else {
          this.el.removeEventListener('click', this._handleClickBound);
        }
      }
    }, {
      key: "_setupTemporaryEventHandlers",
      value: function _setupTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
        document.body.addEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.addEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_removeTemporaryEventHandlers",
      value: function _removeTemporaryEventHandlers() {
        // Use capture phase event handler to prevent click
        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
        document.body.removeEventListener('touchmove', this._handleDocumentTouchmoveBound);
        this.dropdownEl.removeEventListener('keydown', this._handleDropdownKeydownBound);
      }
    }, {
      key: "_handleClick",
      value: function _handleClick(e) {
        e.preventDefault();
        this.open();
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.open();
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave(e) {
        var toEl = e.toElement || e.relatedTarget;
        var leaveToDropdownContent = !!$(toEl).closest('.dropdown-content').length;
        var leaveToActiveDropdownTrigger = false;

        var $closestTrigger = $(toEl).closest('.dropdown-trigger');
        if ($closestTrigger.length && !!$closestTrigger[0].M_Dropdown && $closestTrigger[0].M_Dropdown.isOpen) {
          leaveToActiveDropdownTrigger = true;
        }

        // Close hover dropdown if mouse did not leave to either active dropdown-trigger or dropdown-content
        if (!leaveToActiveDropdownTrigger && !leaveToDropdownContent) {
          this.close();
        }
      }
    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        var _this10 = this;

        var $target = $(e.target);
        if (this.options.closeOnClick && $target.closest('.dropdown-content').length && !this.isTouchMoving) {
          // isTouchMoving to check if scrolling on mobile.
          setTimeout(function () {
            _this10.close();
          }, 0);
        } else if ($target.closest('.dropdown-trigger').length || !$target.closest('.dropdown-content').length) {
          setTimeout(function () {
            _this10.close();
          }, 0);
        }
        this.isTouchMoving = false;
      }
    }, {
      key: "_handleTriggerKeydown",
      value: function _handleTriggerKeydown(e) {
        // ARROW DOWN OR ENTER WHEN SELECT IS CLOSED - open Dropdown
        if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.ENTER) && !this.isOpen) {
          e.preventDefault();
          this.open();
        }
      }

      /**
       * Handle Document Touchmove
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentTouchmove",
      value: function _handleDocumentTouchmove(e) {
        var $target = $(e.target);
        if ($target.closest('.dropdown-content').length) {
          this.isTouchMoving = true;
        }
      }

      /**
       * Handle Dropdown Click
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownClick",
      value: function _handleDropdownClick(e) {
        // onItemClick callback
        if (typeof this.options.onItemClick === 'function') {
          var itemEl = $(e.target).closest('li')[0];
          this.options.onItemClick.call(this, itemEl);
        }
      }

      /**
       * Handle Dropdown Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleDropdownKeydown",
      value: function _handleDropdownKeydown(e) {
        if (e.which === M.keys.TAB) {
          e.preventDefault();
          this.close();

          // Navigate down dropdown list
        } else if ((e.which === M.keys.ARROW_DOWN || e.which === M.keys.A¤]=ïå\{Ø‘=Çdøaa:2ç‚¿“+aÀÖ>»"AÁ^ÿ|²äë,°^ÿÒ"^œ/‹¨=FT$½«×ª¸åmÙ† qÏ M§ãvGÄ {_YKö¾R°cŸ*
ªCPØHÔæ081Rg.fÉkÇÇ»¾¯0o{nÖvŒ¼Ñv£NŒva[b¤¤ÚõØD{'©ÇJDå]îÃ1 šÙâ%[—®Î7Tî4r¢¥%0°©UôZ…Ë|Ù(sıˆ¹è¸‘Û,Ó+şˆ'pÆçæ3eƒíäú—ò+úlÓ*»ØdVXai
íFqMòÊû¨wş
û\I"Ì‘Âf€Ã #‹×¤”*$$0"İGe«w—Ê>S­Œë€kTB¶V …Ğ‹²Hèì_ÒÉ–móÓnØ‰rÄRĞÆ'Giª¾*æõƒW1•Pğ-×¯wÓd|ìI/wñ¶FäÈ\5oWÚü¡úÍİIÀhW‡Xu›1ëÒ0 „Q$Bí-cúÛ9’˜ú÷ZÇËYX¼vÅÊ5äêØujZL­Ø”c6ëC‹uqSo+~”^Ã~ë•Wx3AÎí³=¢å,\ÆîœJŞ”˜êé¨Ğ®}‘k½F5*tÀnz!òœm<ÌJ3<*åì±~şÆÉ(„A†!È	OãÚCK‚s_¿míºj3«Äüx)2şP~³so0·ÄIuANÅdWôC-cèº%%­äœ†q0´¿ªå‹äİïÜ‰º'ıáøDco×«ot¡×yß]¥±v$coë\LÙ»iw1zNàÃâ2¹¾Ìšğ¶ßıRë"eäÁ/èû¯C1QKS¸Y,£åÏ
yˆ¿Ú¢ãşe2c`aøÚˆ÷!-¼åH›ğü"zs'…2ªBfonVçš3¹~:	*5diQN¢J‰ èİwrğ¤0?¡Ø| \-&&Ôò¦Ÿ"fI.…¨:ÊŠÍXOıÑ–euî:cù€@5z!ã³© Èj/ÖõèK9dÒ·€SåÇ®sY´Óª©…²ANlãq“ZÇÀ7¤ <w²MiuÔy^¾Å1°­FÄÁ¥gb,®TŒ5­‘13¹ævƒ
Úì9)›ÓØ²<§çeí5Xe¹÷BVğğdù÷@Õ»öæ†­¯7òò†)ªÅöÆt3¯·JyõQ$Œæ/›å2D5¤À»}üttƒ<Ó\,h”“™<%61ßwºKQ*’ê¶µœ¨It¶‰õ”¢á6z™©ê…ğQ<AWrİ.¿K•ØyÒş6’Í³ã¤Æ†^¦’!Ì±?–µßú9¥õ*ó-‹È½["õ ç»*!€†ÓAÅ‹¶ÊİX(GÁ·¬I
âÎß˜/y´FŸ ÇRÌÒˆ‰ÖäHÈ‡ƒã¸†€®väV@<ÓÇ5'[hÀÙêÈ>e¥&f“Õ;:Jœ>tSLZUÉN–‹µˆ°ËveÿZ#®`÷–F¶5!.ê°?ÎygZvŞî@ÿøY;¸ë`=…è¼Ê—¯Ÿ¶Í•A 9×‹Ù©•±•OÌ3v¥÷[Ñİ/—Å“M@…¼si¹¾$G[êÏûnv1ê› ±u_¬ĞhÒA¤W®ØÊl-(µ Ë£‡ó­<†²¯)WÕò¡'5rª3‚ïæ1FL>jğ4Y„»½“5–±•8{q²y[_ÕfE·ÀÍk"šúòtÂ	@,¥xßd)+]£ûôüÊ=INÏ`;,öû@%úH¨›„’˜È¨f(%DvƒP¢=ygµ¿æYßèÈM\e­£&
¥l]´S&–œĞõ=]K²œDm›0pwWk[½ÓM’ÕÇRõ¤T¶Hg êõ†<ÍºLnØtùj2\‘3 r	n.»0SiÖIT<?ÿH¼0Z™9Öµ_
»»ìVØaßüäz3ÍìÖÚr€„vsGÛ[¹I‡ĞÌr…Èİô[6³úXÃäÇÀ|¿×QfeÏÍLürşª˜ÙU_XL)uzÈ;Ê\àmVËfÓ­·¶]±åqBÏ2¾®ã2Õ¤«z8‡‹×à™<t|É	qõO MÄŒ„RğM$ñœpºywXÛ–ªüÖgäZ$·N<ÄÄün0DE|Ï-a 6ınK«½ì¬as¦ì—íŸÌÌ¶ö	ÎMW„ĞÖ]êİÉ!iHVÿíÚ[”·_Uƒ±>‚}AÉ£©õ„ç‰¤f
J–Pô– n•¨gÕ{z9ò­–`Œg†ÙĞÕ¯ë§ÄWj|Äp¯HS@Zf1ııw=@²ïÄï®_gb_Cğ55T=/{O'çv7*Z»p…=5º!Şˆ¶ôé	“\¥eIòŒb(L,€à%™(~@!:ÓÁî´·yİêo ¢&ã’l=GYí¢Ï[+6—hT^Ÿùû|0^{+´_Ö¶Ìn4”ZfòŸŠº.1–=R.:[ºam%*×A ğo·²¦È­ÑF¾æÖN™*ä*[jˆF0©f#ØĞZ#¬H‹Ş\êl:¼fĞGêˆºš}ŠN×ÃEˆZKkíàüœÑ%…ÀŒñaÀEšXĞm*±~eœœ}Šq¬¿Ç¬z*oçO—è/•)¤T¾1*ëÖt;¶§Àûsà˜’«ˆ£“'+ÂLèN±I›ºû~0TJûèûƒÒÒuáô$+|§š£„V—ÕÊCV(ĞMC+{@˜<íÑZ7ŒÚÌ^À~óÆ¨<Ûë—Ù	?
 '@!&Ğ¥Ò— ½èm@ÃHºzÃlóYÄVcOã@Üù –uØ°[æ;´%)ucsù„ÕtáóÍír‘Ñ&S¦ ’¡ã:ÎÖĞŠPş¤J=îŠ:öÚœE°‹ÑçÕÆµ´BêœĞNc~%> pfû5&¶¬zü}ı·ûôÛ'ÅPdu;ªš¨.-A«ôj¨ãa•€á{É6oD2"ê’–!I9ªş³¡¤§ÂƒMcUœ\=Šı”äò— p‘x7šL2Ú×*Ş´ÛÆ'­ ]súü
÷|Ì‰ûp§n[ê¸jÀêõıJß3	 %Eé”Ñå®DsÉû•z·7Ó•ãuè6•$uû¨IÌô_Î¤ZvÄ¬¦¿WÄ¢ú(ö•Iêq>\õécî¯,cH³–*9º÷%mNÈBÆ‘ê½Òb¹=O{Á|éÓÕ•¼V÷»V%mC'ü”Ô][´0Ç7.“ÌÏ(óıã`5ú‡ü*“ƒDc8Õ5ÛÔÚÉuÑN-'²…zpHµtEŠ#=ÒöõÙ‘Ût¶´°Ç<ƒ¢ Å’ÀSÿ7Ñ}¶ƒ§¼Õùh+%Œs*Öİd2Ğ‚WÆZÇ‘ò{Wë‡>èåğóC¦
Áıb©ñ\„5àğÉqoëÕİx!K®İÀí1E…ƒ>QÉ3j¹›Š§E&#÷•3µí¯e³­bÂ‘°¬À+Æâ‡ˆÓ|ßÂÆñ<şd*2- ˆçÊ`öÎ¸ûIm³~¥ãØ î[İ×K=«bñÉ<ÃsÌŞ›Ú§…rÉ¾A”t—óo^ÕúU,2·xÍI‹„¤f< °±™’x´k&%¨îÀæLš(©ï$1Sjpz~–Æğ£vNûÙ
œw¡MOÍÛßË…Şúîü>Õ^k¾Z"ÊÇTÅØç‘8ì¼l‚ôÂò·$Åè[»Å£¬h(áëäß™½Vô},„X0v™Ô¢W’™w¾,l°¿–1r²g”½Ã„Ïâö“ì[(ü	.IJ£‘JÇ3Èü2vX.€ÇÈèg›Ï«‰M–…ı›E¢­Ş”ºT”ßáÍbœ1ˆáõÓHde=ËFôè4ôàä@OÛ/ûÍbgöN 	óbY¦V5´©Xƒ„;ƒ‰_(Ö€>ÑÇ:…=¡ï]+éÜx~sÈ@"»ØÜ¢4e<¥¤’ùŸŠçXl «ö
ôâ-#‡Á¼Õ¹íÉ«	µ2…OpØwî–Rk~{Èû¢#rr8‘:v–™JÌ¡Ç¦× öá§nâ:„0p#*ÚëºPS¸®Ñ=èdQ¥Ï?2ş[Já¶gT†MOU…¥¤w²ÖÚjvD•'ƒº&«‰ >_Zçàcšõby=íQŠ[s¢[÷*g¸½.Â‚ºŒNf	üãxP›‡Ï¹À$:ÃĞ9óéÔ7^l.¥µOèÓĞEr‰FÁ?;²Ù ı©ÿ|Ç yI¶âö–E-·G€àf-ˆ’fVéîAîE6Ø†î¸1šş4KÕªuÜníÉt°(õ—¶üDz<‡£{ã°
ğîl@‘g2 ù&3D:µÇÉyOO##~‰Yÿkªà8­¬@ÅPFÄyó1šxXWU“É3¸6Dû‚fPä:jH0Vª#?ì†˜.óyöm´fÓ²D]„²Ãâ½ä’;6)gl³|}I"ºHM)î¸I	—®aˆA%K»’tLĞ×¼€%ÀV~h°ºïkíÁÂBu¨Q©(šÅËŞÉ}ù¥kwfË¤Kßñô©¢Ğª»ÉhÅ“úEÄÛ¯4¯…j/ó`JÈ1ENÌ	ù²àÕ£=.4pYÜ#5f—´¤kcËÄœ7•ˆlÏ´¨¸Ù/—.İt›×û6®¥üT=—ÛX>/¦´öÎ•t;a æ¬=ƒgrÖŸ™TSåiCûœkƒ^öw:5.(Ö“êøÈ¥stgg:Jj-PÃÍíR[ª°$‚@clP¢NŒv‡¤€d>ONPLKéÅÊª6zU&©ÏfrÅI¹•+ñŒ|î†Ü¥UjÔô_
Xîıl™Ï0eÍ6P§œ°ubÜ6!øNV9&a—Ôåa˜éí[Õñä»RXÉÌüÿlFµHá}Í›úˆ„J^—)ÂİÍ™`‘8^j»zÏ yÜr‘á÷9tC@ğ¬kAeüKĞÀÎíáîª^ğò`G…¿$ù\2Q«<˜ÖHm ¾N,bz²Têï1 %’¥³Õ/ƒ{q0²9­Z6¥²•FŒËåf`š[o íìÛû›‰B†cÏ›5B%f¥‡¿e¹¨¯çeK“/9Nƒ ÊØ·Rì;±=Ä)à¿Š8‚ÒïÁéääÜĞ&bÉÃw»¸¶Û9Õ&Q;4˜uÿA’Ê¤XŠ>•|Ù].$X1ñ|E6}õx8ŸU6ÖfT{Z&»"~€aatÑÎ–u ö1oÈì-õ2Úõ¸4òÚ—Øbß’©ûXÿ\lt±)ŠKá^3ÂFzÔyF‰$qÙÓrR¬ë5ÿ[‚ÖİÌfg¸ª=>OverflowParent = !!this.dropdownEl.offsetParent ? this.dropdownEl.offsetParent : this.dropdownEl.parentNode;

        var alignments = M.checkPossibleAlignments(this.el, closestOverflowParent, dropdownBounds, this.options.coverTrigger ? 0 : triggerBRect.height);

        var verticalAlignment = 'top';
        var horizontalAlignment = this.options.alignment;
        idealYPos += this.options.coverTrigger ? 0 : triggerBRect.height;

        // Reset isScrollable
        this.isScrollable = false;

        if (!alignments.top) {
          if (alignments.bottom) {
            verticalAlignment = 'bottom';
          } else {
            this.isScrollable = true;

            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnTop > alignments.spaceOnBottom) {
              verticalAlignment = 'bottom';
              idealHeight += alignments.spaceOnTop;
              idealYPos -= alignments.spaceOnTop;
            } else {
              idealHeight += alignments.spaceOnBottom;
            }
          }
        }

        // If preferred horizontal alignment is possible
        if (!alignments[horizontalAlignment]) {
          var oppositeAlignment = horizontalAlignment === 'left' ? 'right' : 'left';
          if (alignments[oppositeAlignment]) {
            horizontalAlignment = oppositeAlignment;
          } else {
            // Determine which side has most space and cutoff at correct height
            if (alignments.spaceOnLeft > alignments.spaceOnRight) {
              horizontalAlignment = 'right';
              idealWidth += alignments.spaceOnLeft;
              idealXPos -= alignments.spaceOnLeft;
            } else {
              horizontalAlignment = 'left';
              idealWidth += alignments.spaceOnRight;
            }
          }
        }

        if (verticalAlignment === 'bottom') {
          idealYPos = idealYPos - dropdownBRect.height + (this.options.coverTrigger ? triggerBRect.height : 0);
        }
        if (horizontalAlignment === 'right') {
          idealXPos = idealXPos - dropdownBRect.width + triggerBRect.width;
        }
        return {
          x: idealXPos,
          y: idealYPos,
          verticalAlignment: verticalAlignment,
          horizontalAlignment: horizontalAlignment,
          height: idealHeight,
          width: idealWidth
        };
      }

      /**
       * Animate in dropdown
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        var _this11 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: [0, 1],
            easing: 'easeOutQuad'
          },
          scaleX: [0.3, 1],
          scaleY: [0.3, 1],
          duration: this.options.inDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            if (_this11.options.autoFocus) {
              _this11.dropdownEl.focus();
            }

            // onOpenEnd callback
            if (typeof _this11.options.onOpenEnd === 'function') {
              _this11.options.onOpenEnd.call(_this11, _this11.el);
            }
          }
        });
      }

      /**
       * Animate out dropdown
       */

    }, {
      key: "_animateOut",
      value: function _animateOut() {
        var _this12 = this;

        anim.remove(this.dropdownEl);
        anim({
          targets: this.dropdownEl,
          opacity: {
            value: 0,
            easing: 'easeOutQuint'
          },
          scaleX: 0.3,
          scaleY: 0.3,
          duration: this.options.outDuration,
          easing: 'easeOutQuint',
          complete: function (anim) {
            _this12._resetDropdownStyles();

            // onCloseEnd callback
            if (typeof _this12.options.onCloseEnd === 'function') {
              _this12.options.onCloseEnd.call(_this12, _this12.el);
            }
          }
        });
      }

      /**
       * Place dropdown
       */

    }, {
      key: "_placeDropdown",
      value: function _placeDropdown() {
        // Set width before calculating positionInfo
        var idealWidth = this.options.constrainWidth ? this.el.getBoundingClientRect().width : this.dropdownEl.getBoundingClientRect().width;
        this.dropdownEl.style.width = idealWidth + 'px';

        var positionInfo = this._getDropdownPosition();
        this.dropdownEl.style.left = positionInfo.x + 'px';
        this.dropdownEl.style.top = positionInfo.y + 'px';
        this.dropdownEl.style.height = positionInfo.height + 'px';
        this.dropdownEl.style.width = positionInfo.width + 'px';
        this.dropdownEl.style.transformOrigin = (positionInfo.horizontalAlignment === 'left' ? '0' : '100%') + " " + (positionInfo.verticalAlignment === 'top' ? '0' : '100%');
      }

      /**
       * Open Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }
        this.isOpen = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Reset styles
        this._resetDropdownStyles();
        this.dropdownEl.style.display = 'block';

        this._placeDropdown();
        this._animateIn();
        this._setupTemporaryEventHandlers();
      }

      /**
       * Close Dropdown
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }
        this.isOpen = false;
        this.focusedIndex = -1;

        // onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this._animateOut();
        this._removeTemporaryEventHandlers();

        if (this.options.autoFocus) {
          this.el.focus();
        }
      }

      /**
       * Recalculate dimensions
       */

    }, {
      key: "recalculateDimensions",
      value: function recalculateDimensions() {
        if (this.isOpen) {
          this.$dropdownEl.css({
            width: '',
            height: '',
            left: '',
            top: '',
            'transform-origin': ''
          });
          this._placeDropdown();
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Dropdown.__proto__ || Object.getPrototypeOf(Dropdown), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Dropdown;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Dropdown;
  }(Component);

  /**
   * @static
   * @memberof Dropdown
   */


  Dropdown._dropdowns = [];

  M.Dropdown = Dropdown;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Dropdown, 'dropdown', 'M_Dropdown');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    opacity: 0.5,
    inDuration: 250,
    outDuration: 250,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    preventScrolling: true,
    dismissible: true,
    startingTop: '4%',
    endingTop: '10%'
  };

  /**
   * @class
   *
   */

  var Modal = function (_Component3) {
    _inherits(Modal, _Component3);

    /**
     * Construct Modal instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Modal(el, options) {
      _classCallCheck(this, Modal);

      var _this13 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, Modal, el, options));

      _this13.el.M_Modal = _this13;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [opacity=0.5] - Opacity of the modal overlay
       * @prop {Number} [inDuration=250] - Length in ms of enter transition
       * @prop {Number} [outDuration=250] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before modal is opened
       * @prop {Function} onOpenEnd - Callback function called after modal is opened
       * @prop {Function} onCloseStart - Callback function called before modal is closed
       * @prop {Function} onCloseEnd - Callback function called after modal is closed
       * @prop {Boolean} [dismissible=true] - Allow modal to be dismissed by keyboard or overlay click
       * @prop {String} [startingTop='4%'] - startingTop
       * @prop {String} [endingTop='10%'] - endingTop
       */
      _this13.options = $.extend({}, Modal.defaults, options);

      /**
       * Describes open/close state of modal
       * @type {Boolean}
       */
      _this13.isOpen = false;

      _this13.id = _this13.$el.attr('id');
      _this13._openingTrigger = undefined;
      _this13.$overlay = $('<div class="modal-overlay"></div>');
      _this13.el.tabIndex = 0;
      _this13._nthModalOpened = 0;

      Modal._count++;
      _this13._setupEventHandlers();
      return _this13;
    }

    _createClass(Modal, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Modal._count--;
        this._removeEventHandlers();
        this.el.removeAttribute('style');
        this.$overlay.remove();
        this.el.M_Modal = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleOverlayClickBound = this._handleOverlayClick.bind(this);
        this._handleModalCloseClickBound = this._handleModalCloseClick.bind(this);

        if (Modal._count === 1) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].addEventListener('click', this._handleOverlayClickBound);
        this.el.addEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Modal._count === 0) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
        this.$overlay[0].removeEventListener('click', this._handleOverlayClickBound);
        this.el.removeEventListener('click', this._handleModalCloseClickBound);
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.modal-trigger');
        if ($trigger.length) {
          var modalId = M.getIdFromTrigger($trigger[0]);
          var modalInstance = document.getElementById(modalId).M_Modal;
          if (modalInstance) {
            modalInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Handle Overlay Click
       */

    }, {
      key: "_handleOverlayClick",
      value: function _handleOverlayClick() {
        if (this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Modal Close Click
       * @param {Event} e
       */

    }, {
      key: "_handleModalCloseClick",
      value: function _handleModalCloseClick(e) {
        var $closeTrigger = $(e.target).closest('.modal-close');
        if ($closeTrigger.length) {
          this.close();
        }
      }

      /**
       * Handle Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleKeydown",
      value: function _handleKeydown(e) {
        // ESC key
        if (e.keyCode === 27 && this.options.dismissible) {
          this.close();
        }
      }

      /**
       * Handle Focus
       * @param {Event} e
       */

    }, {
      key: "_handleFocus",
      value: function _handleFocus(e) {
        // Only trap focus if this modal is the last model opened (prevents loops in nested modals).
        if (!this.el.contains(e.target) && this._nthModalOpened === Modal.q˜ÏáÀôŒ¼ªb¡“(í£*kurêsó±Y¬DâŠ÷+QÆœÜÇç2şx Šæ
%1•mDÛ@O_e~âD_”·y„Q6Ê(MâÈ_¬à:Uˆ781õ$å±ÓèqÈ)ÄĞ:U$¯gBı9.H¼=ƒs+{ƒ ïh„î‰JÜÚ±y ŸéüvQ]lĞNÈ™È™ÁÜåWJ#äßn-HÍ*’Wˆ¢”öµr&-‘°÷ÁÀE¾FåtÖ#~ù1ëÜu)J¹ïÊGÇE _ş61íòÄ…¬Z&oj|+÷GôxË{gä|€"	ˆÉháî@ Pše}¼R¹ó3Stîã»”@yªúÔ<²m½¦@Û¯jÎ²î>Lôm¿ø2 ‘¨.Ïh ªP˜£i»6›šfæÑÏEä“YÎjğ~_U/$izQX‹{ê¨'ïÅ¿zç¿µpõÈhı‘°¡m¯O®à’¨©MwÉf4È÷ßş³Ş ¯¢6Õö¾o+§Â†ù‡±Nèß†ŞÃ&QŞ½Ú%VpN;¡FúT=[v×?ÿMe™;¾EızA6¸Õ&åÿ>š‡Şéä8± M¯8ysªåÇè]TâösYw|g´c3Ú3D¤p J±½ t:jğû×Jjw!òÜ?•ï]
yÅƒ0â‡k2•µÄÎ	ŒZÇ¯ïûöHUù¬şé²§lÂéÅLéáëËáè>ùQA;[À%?&×Í„oÑÖßıöKéĞ22²¦É»Èhıä*9ÚNƒ£»ş5?×&®NéQ^“ÿCMõ'Z|— Ò˜Ÿ¦ë!§ kB?šh‹´ Yõæ–9¸ÿ(Z;MûÓ+üPfÙVu‡H¢‹úNbªI!ş¥‰5W3*•ıÁªÃ•ê°®¼b˜xq¨+OzCë®Çq&–Ä7‘À1=‹ÚS÷³öœIlL…Av0˜0ü"F8¹«†ûW/Fİ.ŒlÚ#ZÅ†l£x”Ã8 .¼'Q2\»RY¾Ç:ı˜(ØÃK­=`Ò÷LÛ™ôİ;ğ(.-„ò¤åëÁéŒ™ÀG¥ÊÂ¦äÙHÄığñwŞN?É&OŠÇåŒfüäûŠü7<íöí0@}jÿrÏZË\eËÌêUÏÕIv	/†ŸUd`æwˆ\®üKÚ„ïû”´Ëøò8åÅv´Ù¿Öï£ÈäèüSß$wUJ:.Ú¼¸\)rü¬E›«½ı9KÀEà<SÃéÂõºVÀÄm<fyi¢‰jË=ÕgWí¼^ë~J¬æ‹±%ÒËVBæaşó OjÁG`³ÿTìj&ûÌê¬jÂc#gÎ€x>úwg…£“Øx>>yQ<ºçİ"Û"Îõğ¢TØúv85B(ç6îeÎ>»KµÆ_òÚŞÉ;NŸ˜tRÊÜÆÇ…†×C¦?h©˜ğ’£˜‘Ë¨¬„€7HÁNT¡·ŞZA×|¶ä×ŒxUyû*ãÏ†¡®Ù$Û¾š­ÃWécaÍ€
›¼Ÿ“¼`l¸|ÏïMu¼¦uXµşºÈ5Ë*ç›%G$Ïõl6]FÄ¬y…/·’¿9*N§EÓ7›îT{OÚ÷Rœ¬&Ÿ\ĞÁòYóÑ=³„ˆ%.dÊyZ¥¿uº[tKøXò…&T?8J­&\´m­ç©·Å4¸a¦ƒÍ>L5ûë2\…’——ä.qÇ&^tÅÚ
x;tøe(ç+3ó³ùD!VmÅdÇß¸şVÌjÈª§'`¦ß/e£„º£ŠÚµ8–ÿv½ÒKæQÆJb¨šå7’×+QA]ùv\úÄÒ„2Xo<ôÆÅ
°	.ˆ	›!ÍwÔH	z¾u 0¥|Bôèá˜#húj4’shˆÑ/œ NÑÆqWµx¡Aöj´¼v@qòEõçÚ#å¸—×7üì©öQv¥î*:e·İSdøb}‡¦jÿ2J…6Òcµõ2
?¨@Şhæ9äõ¶*÷é6)JpFg`Ô1½Ÿº<tªŒ-fvDÚgsY[F£¥\‹”¡R¦ëÿpCj5(ÿÇşš»¨™7‹­!­Ó¨%R==ÑƒÑŒ©ßN;Kã[[{½}Røk‡é¤Hxól7ºXºd0<G9l®Ä)kÇµµğ Ç^ÓŒ:À/¾ÃõI‰b£~n‘ökivóøi‰UX÷¡ïŠ¾ôö	N¦Û×9İ8İS	pqª¿øëzvç-³«#æŠ£g;ó„e¾-ç>Í$ãAk|ş…,'`ìä±Ğİ™F2Èu®ØÎ²fà‹YßßJÚB_ŞüÊÎë‡úÓâ´.%L¿TŠE0v$LÕîy®Æ¤m‚˜)Ós
e„!7/Z†OóÜıSv`ğ
îŠíÎeƒ+«y
º=•­c¢&0­ÃÇ¦!óp®A¯}#x³VBĞ¼"qDyÁ@éØFÒŞ¨Aï	(º£SğÈ|.şï°È\½c]ÑêF¾¤õa[ùLÃ@¼¿;úÜ¿5Í¼„³å_ÂChoC°	l¥S”à
¸D¶,×Œï»Èô÷Õ@êqedıªÌ>SÔt³ €	ùç}(§¸lpKWL{»…x½¸ŒëŠJâeZˆï‹[‡Ø®Ë^8wr“{ßÑ<pğ¸Fä$BÚO/õGŞ†ıV*pöóŸ¯2ÛgZ…=í†|Î†®W,ëÚãTH–«Ç—c˜3Bt	)şÒ"6úW°á¢Êkšw“rV“%~NIÎ%{7®¡Ul£àuc®@âÙ²×ÂÆôØU+ê­ (6¸"Ê®GÖ0¥ïÆMá"y´£„v´Ÿ{+Ó)Wæƒ¶ERşqŞÒ:÷TûŠÑn:ôa>n’šü¾1ûS$ƒ7Mu¹7ôå.ñû¦uïHQA¿Åõ/†¾@“á;ÉëĞF#¶ØGIæ–˜àR7R#‡©š‹xÆ†è¥°q;›Éé’eÚr™‹dZL]z0Å/õèPî²ş¢Òã©‘1àùãnVx•³rTA–ø»"wµ ÔÛ<b…Æl-& ˆò­Óè=ê¶Cúám—~…4f8G§g¥÷†@`™q’îË Š5İÚDín+˜‰5d0AÛ2½h•EÚ?—á”#3¡É|VW×»„k-ÕwB-“ócñ•mĞ2á<e+¹R*u]v:Q&÷ù’¯:š(İ’dœzÅ~L¿Ê‡©DeÑ)Õ]‚>ÑoéüÓO6ÖÃ”"Î|¬xˆ ıkîÃ·ÙÓKmYŸ“WMÕŠQL­*ñ6øÖ·JµX]à”}Æïéƒo¾|ÄØ’Ím€œ7Š7;óüò‡èH]4D4šÇ3ÚÓá˜8í¸”&aïW{Lñ‰ïóoû"ƒÃ‹ÒâèÓe4û
;ê€MœšôˆBO9sñ‚MáÅˆìşMAãÂ<ÎW>ÖEG@9ÿYrÑÔÇş²zcˆrM	P ¬gù³EWI¶Ü2E"ôEéğ<6Ô±ÏñnÓf¶)Ü:õœoÈrš{×÷Sî"18–"¢'¯¦U¾Ë—[W×¶i‚¦=üÙJ;Ôœ0$’ØÙ0Ì¿£Ş¡ê©¾jÒÇN(ëöÊe[_¾˜¦êä-Á‹²mgcõt–/—:Öİ°†¿©6>áhŸ†wùZùÁ—9ˆÌñE”«SéŒ(‘ó cZâcÒ® —íCÔ\viÒêœJ	fÛ«flœàöÈCŒoÀÕe`oªÒŞbëÔ‚Ç@Ï¨ƒvõ—ä˜É"ö>6¸³Á[¹‚³d7oæ'é<¶|ñ´Šébr”E¶Ù‘§–p=¹5hH°~„p/ıŒá¿vÀE3ØÄG	ñøˆ™~^e$o!¯Ö‹³DèĞ;.¯bRävÇ=µü[k\W<ÑKºå¦_ûÕLR}Ly!Åã˜'{íÀHÒ££Ú
w=k#å…¸4]¢+’€¼¶ì7¹‘	ûî·ìú®&n¼n(’Š WåÛış÷°šHü»¹Æ³– ¹cOß¼}×2Œ¸B½10Òà7ÚoƒF‡ Ó¶EÀ¢Ï›].‹sİÕ{±Ã"ŞcÚÕ.&eK~†Çßj¹ŠLu·¬3	6ÇÁà£MºŸÁTÍsG¹r)ÆˆqèWI5*‘fv]7Øş7ú@Ó%Pü	¹“²§ì®¸›ü	#¯ Œ­jì6o‚rûËôYbbê³š]’;,2k:¼lkÀ?lÎ~ëùÇ„k?ÍûÉzîÒgÒuÓ†£„§î”•nÎ¸D;P2sàï$É¸ó»z®®$:«¨ÿrB^ã¨Ky û„ÖÂ.Z<¦ã×†ĞÌ©HmßVäŞùïÒ±}ôÛ£ñ÷«*ÌøBŠØ+´øyQŸ»ÂoAQ«ç•‚ü³ÌCÛ®<¤óiÊÑ’&ì(ùX|ˆ-×›œX±BKÆˆó™¡ÏèØÎÖëÕa¡»«¹æë£¨7ZÍaĞ‰¡º?ëÆ#3ª…Z~O»Êû@å‰¶•jájÙ?	S‚Xuî(àåcÕÅöŒ2ó~ı½G{7à•çUì€ùÌÄïôH×ğt5óÉ7ùÆ\êÿ}áüèÓş(¨hQxÜ­µŠ×Ö9àçüı²<Û´Íş&R4
ßWRÚ…!'¬H´äãë^¦¹ÊØÜçR—$Âa38Ü©}"Çê ’Îè­Fsó»Ü…²ÜODÇw°šJ†±Ñ¶>•¥K\áDZÂa§ŠÛÇc@»Æf"CY ğ¼j½àùDïşæĞóiÌ@y¬Ä•€¡œ'¶*qˆ&"Ó›ª÷›LsP1«Qx&Î 0:h'BƒF×å:¯)ákíĞk0Qˆû…Ğœ“"•r‹æ®cÍá$ã.#³u¹oÍÉ—6¨©v÷R&Í_s3SSLŸalL39’sµyœºÈ²Øl^côôÖ¡‹Õ q]”nÉK¯té:«®òÓñ+Œ;†§ô'5¢6÷¨ 5ğ şì|Î¼wÚ“÷ª?òqÛû.Úïñ¦çô^X+QIÖ±×],‹Š}£ÀQğCóIùñÜ‡å|iB,Ìbøo¦7¤<jXÚ2• ‘aÍ1Ş
ı‹Ş1lX/æ‚ÑÁûåÈÍºˆ£Bµ\H˜šò\ ´ïB:Ä@ÖâÁÎ˜qÇÊ{¨)ú×—s_MQ‚¬é–Y†
½à¯kIm&åO
İø¿P5PsÊIµÌ„Ø¨ëŠË›ãupşÉ6ôŒ»Ù£†µç»¯q»c=É1Z7ÀñoÚ§¨‡P<
nt('afterend', this.$overlay[0]);

        if (this.options.dismissible) {
          this._handleKeydownBound = this._handleKeydown.bind(this);
          this._handleFocusBound = this._handleFocus.bind(this);
          document.addEventListener('keydown', this._handleKeydownBound);
          document.addEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateIn();

        // Focus modal
        this.el.focus();

        return this;
      }

      /**
       * Close Modal
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        Modal._modalsOpen--;
        this._nthModalOpened = 0;

        // Call onCloseStart callback
        if (typeof this.options.onCloseStart === 'function') {
          this.options.onCloseStart.call(this, this.el);
        }

        this.el.classList.remove('open');

        // Enable body scrolling only if there are no more modals open.
        if (Modal._modalsOpen === 0) {
          document.body.style.overflow = '';
        }

        if (this.options.dismissible) {
          document.removeEventListener('keydown', this._handleKeydownBound);
          document.removeEventListener('focus', this._handleFocusBound, true);
        }

        anim.remove(this.el);
        anim.remove(this.$overlay[0]);
        this._animateOut();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Modal.__proto__ || Object.getPrototypeOf(Modal), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Modal;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Modal;
  }(Component);

  /**
   * @static
   * @memberof Modal
   */


  Modal._modalsOpen = 0;

  /**
   * @static
   * @memberof Modal
   */
  Modal._count = 0;

  M.Modal = Modal;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Modal, 'modal', 'M_Modal');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    inDuration: 275,
    outDuration: 200,
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null
  };

  /**
   * @class
   *
   */

  var Materialbox = function (_Component4) {
    _inherits(Materialbox, _Component4);

    /**
     * Construct Materialbox instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Materialbox(el, options) {
      _classCallCheck(this, Materialbox);

      var _this16 = _possibleConstructorReturn(this, (Materialbox.__proto__ || Object.getPrototypeOf(Materialbox)).call(this, Materialbox, el, options));

      _this16.el.M_Materialbox = _this16;

      /**
       * Options for the modal
       * @member Materialbox#options
       * @prop {Number} [inDuration=275] - Length in ms of enter transition
       * @prop {Number} [outDuration=200] - Length in ms of exit transition
       * @prop {Function} onOpenStart - Callback function called before materialbox is opened
       * @prop {Function} onOpenEnd - Callback function called after materialbox is opened
       * @prop {Function} onCloseStart - Callback function called before materialbox is closed
       * @prop {Function} onCloseEnd - Callback function called after materialbox is closed
       */
      _this16.options = $.extend({}, Materialbox.defaults, options);

      _this16.overlayActive = false;
      _this16.doneAnimating = true;
      _this16.placeholder = $('<div></div>').addClass('material-placeholder');
      _this16.originalWidth = 0;
      _this16.originalHeight = 0;
      _this16.originInlineStyles = _this16.$el.attr('style');
      _this16.caption = _this16.el.getAttribute('data-caption') || '';

      // Wrap
      _this16.$el.before(_this16.placeholder);
      _this16.placeholder.append(_this16.$el);

      _this16._setupEventHandlers();
      return _this16;
    }

    _createClass(Materialbox, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Materialbox = undefined;

        // Unwrap image
        $(this.placeholder).after(this.el).remove();

        this.$el.removeAttr('style');
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMaterialboxClickBound = this._handleMaterialboxClick.bind(this);
        this.el.addEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleMaterialboxClickBound);
      }

      /**
       * Handle Materialbox Click
       * @param {Event} e
       */

    }, {
      key: "_handleMaterialboxClick",
      value: function _handleMaterialboxClick(e) {
        // If already modal, return to original
        if (this.doneAnimating === false || this.overlayActive && this.doneAnimating) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        if (this.overlayActive) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       * @param {Event} e
       */

    }, {
      key: "_handleWindowEscape",
      value: function _handleWindowEscape(e) {
        // ESC key
        if (e.keyCode === 27 && this.doneAnimating && this.overlayActive) {
          this.close();
        }
      }

      /**
       * Find ancestors with overflow: hidden; and make visible
       */

    }, {
      key: "_makeAncestorsOverflowVisible",
      value: function _makeAncestorsOverflowVisible() {
        this.ancestorsChanged = $();
        var ancestor = this.placeholder[0].parentNode;
        while (ancestor !== null && !$(ancestor).is(document)) {
          var curr = $(ancestor);
          if (curr.css('overflow') !== 'visible') {
            curr.css('overflow', 'visible');
            if (this.ancestorsChanged === undefined) {
              this.ancestorsChanged = curr;
            } else {
              this.ancestorsChanged = this.ancestorsChanged.add(curr);
            }
          }
          ancestor = ancestor.parentNode;
        }
      }

      /**
       * Animate image in
       */

    }, {
      key: "_animateImageIn",
      value: function _animateImageIn() {
        var _this17 = this;

        var animOptions = {
          targets: this.el,
          height: [this.originalHeight, this.newHeight],
          width: [this.originalWidth, this.newWidth],
          left: M.getDocumentScrollLeft() + this.windowWidth / 2 - this.placeholder.offset().left - this.newWidth / 2,
          top: M.getDocumentScrollTop() + this.windowHeight / 2 - this.placeholder.offset().top - this.newHeight / 2,
          duration: this.options.inDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this17.doneAnimating = true;

            // onOpenEnd callback
            if (typeof _this17.options.onOpenEnd === 'function') {
              _this17.options.onOpenEnd.call(_this17, _this17.el);
            }
          }
        };

        // Override max-width or max-height if needed
        this.maxWidth = this.$el.css('max-width');
        this.maxHeight = this.$el.css('max-height');
        if (this.maxWidth !== 'none') {
          animOptions.maxWidth = this.newWidth;
        }
        if (this.maxHeight !== 'none') {
          animOptions.maxHeight = this.newHeight;
        }

        anim(animOptions);
      }

      /**
       * Animate image out
       */

    }, {
      key: "_animateImageOut",
      value: function _animateImageOut() {
        var _this18 = this;

        var animOptions = {
          targets: this.el,
          width: this.originalWidth,
          height: this.originalHeight,
          left: 0,
          top: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            _this18.placeholder.css({
              height: '',
              width: '',
              position: '',
              top: '',
              left: ''
            });

            // Revert to width or height attribute
            if (_this18.attrWidth) {
              _this18.$el.attr('width', _this18.attrWidth);
            }
            if (_this18.attrHeight) {
              _this18.$el.attr('height', _this18.attrHeight);
            }

            _this18.$el.removeAttr('style');
            _this18.originInlineStyles && _this18.$el.attr('style', _this18.originInlineStyles);

            // Remove class
            _this18.$el.removeClass('active');
            _this18.doneAnimating = true;

            // Remove overflow overrides on ancestors
            if (_this18.ancestorsChanged.length) {
              _this18.ancestorsChanged.css('overflow', '');
            }

            // onCloseEnd callback
            if (typeof _this18.options.onCloseEnd === 'function') {
              _this18.options.onCloseEnd.call(_this18, _this18.el);
            }
          }
        };

        anim(animOptions);
      }

      /**
       * Update open and close vars
       */

    }, {
      key: "_updateVars",
      value: function _updateVars() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.caption = this.el.getAttribute('data-caption') || '';
      }

      /**
       * Open Materialbox
       */

    }, {
      key: "open",
      value: function open() {
        var _this19 = this;

        this._updateVars();
        this.originalWidth = this.el.getBoundingClientRect().width;
        this.originalHeight = this.el.getBoundingClientRect().height;

        // Set states
        this.doneAnimating = false;
        this.$el.addClass('active');
        this.overlayActive = true;

        // onOpenStart callback
        if (typeof this.options.onOpenStart === 'function') {
          this.options.onOpenStart.call(this, this.el);
        }

        // Set positioning for placeholder
        this.placeholder.css({
          width: this.placeholder[0].getBoundingClientRect().width + 'px',
          height: this.placeholder[0].getBoundingClientRect().height + 'px',
          position: 'relative',
          top: 0,
          left: 0
        });

        this._makeAncestorsOverflowVisible();

        // Set css on origin
        this.$el.css({
          position: 'absolute',
          'z-index': 1000,
          'will-change': 'left, top, width, height'
        });

        // Change from width or height attribute to css
        this.attrWidth = this.$el.attr('width');
        this.attrHeight = this.$el.attr('height');
        if (this.attrWidth) {
          this.$el.css('width', this.attrWidth + 'px');
          this.$el.removeAttr('width');
        }
        if (this.attrHeight) {
          this.$el.css('width', this.attrHeight + 'px');
          this.$el.removeAttr('height');
        }

        // Add overlay
        this.$overlay = $('<div id="materialbox-overlay"></div>').css({
          opacity: 0
        }).one('click', function () {
          if (_this19.doneAnimating) {
            _this19.close();
          }
        });

        // Put before in origin image to preserve z-index layering.
        this.$el.before(this.$overlay);

        // Set dimensions if needed
        var overlayOffset = this.$overlay[0].getBoundingClientRect();
        this.$overlay.css({
€ñPåÊÔVX‚Êë´=¹ª0¾:ÄKéÉ£LÜDµåq=<r[ü±#8À«³@j¸ÆæNòü6hÂS<Ñÿ¶JëÏY4:‰(‡kÿ°nà<7'£İÔ ¤NÜåıFJi>±=¢µÒk AÙë‰<&µz”jïÌU?i’ÀÉl•òRş«Dàùx6^²±#™Ü3öˆ}ĞŸMã'b†ÑxCÛ>¦â‘ Á¸z›"¤½áw¿°L«|a"ß™>á€/|b'S%ı‰;$ÖU"KŒWõÓ³q¯SMİw™CJ•¼uP‹îËõ!9ªº jAJ´	S¬™èò|à­–ÃÒn?L´—P9³NèEzİiÍÜ…$'™H„¾nI\+x„:>šìé î^=ÖëCÈ¹8ë§8Ñó™5Ó;K’´Pÿb €Æ-óW§JÅ
F@æİÈÚ¶æ=²¦—9Ò7;Ph÷º³ü3Ô†ıÚch„iÕÜÒ–r%eĞª[\SáÚŠ‹¼m¶e,Î;K'Ç(U™u ä„5cX§#ÛÂ9À2~ >Q6i¿Sé…=’Ãad;c<{e–YË1öıù[	÷Z‰Ÿ!²Ùº÷JÚmc@ƒÄîç†ÙìœˆÍ'N"C8fÉmvº\ü=Š°a"³õ;LA“+øpL«+)"$üzTÇUËh¸¬<lÑh‰ÎdXÅššw*x
kMÁòô·WgNUÚ
Á^ L¦á.nh®’”wwâñJŸßŒˆxüò½jÓhPµŒHHêğHÚİ¢i÷¿©ÚLºœ¡×G½ŒUÄC Daj²YEÇ[]sÈSV£T LÁŠF­j mú C±Fn_fÉİDK<h-Äõâ&
è‰H±yY’>ÁÌ…^‚äŒJºšÛ¦˜Q£i^İ¿dš¹¨?Èç^ó2Ö¦+*ëÈì¤—µâK¡ÀŸİÉezŸˆY—ƒ»#hÍ«¨AÉA¶Áÿ0î“!ékçaaóÑ	V:ÒhÑ¶í!vØš!+ÕÔ¸-7}ÁŠÑJ¥ÌZhÆêqœiK8Üz„Œ¸Ë?Lx~í”hÅÃÄs˜ÏËø“u1Eg£ñŞÌs†h,ïÕ «„-ZêrzÁşH‚ ’y¥ñq‚8­q£
Á!¨óepÕnŠ·q¹g3S‚œ#â-Â÷‡ë¸îÄ(‹ñ9fÇ/¡	ğBaÎßcÍ™QT¸µÅË¹×ÿL¿ú³BRkmlÉ¤ñ ‚£¢†QWFäÒ;ån¦—”ŸeÉ.ìnu€¬§¶X”úÜ¼¬å®µV%5a.šË[âLpPí,ôd&OoÜë©\ó¤Èq-ÕeLÉ’,g+—)zö¨KR´%õ>ˆS«å¶@J'hnÍoUäp¨§ÊUY‚Ï¡§iØ®­HŒo†wÚ«å¤ù`ßÓzpùN¢ñ‰ÜYÏ‘í—%)9³¾Š¾«Á‡§„ÑÅø\l®(äB¬ &U›ÎTµ¦ş•/Æ1o6´´Ìcôø•7Æõ™Û¼m>û,5\×Yà»ÑİŸü@<b<ılıÆB¼…eF:ˆÏPf+—±ÒØğ»`–½$n¾ïÚÈ¥ı<!2ìMŒ"+ê&Š}‹´íğœx2Å9ãZ?ï½¥uàd¼ÂE£v9gşOfÿ‹5H3ÛĞÍR^‘Ğ”€røl§Û2Vã‘4¼EõÆw:º2ƒ
r<İ:Ÿìâ©?Í©®šàZe×``¸¬±şÊº­sÓ$ eÓ<ñëOğ 3Xhô+Œô[›ÙN—^ñ®”ùâ>ã8İœ”­°Y= Há .#Ld$_O~S
~ÛÔ¼¬r¹µ¬½«ÖEÓi™>ÑÅv'à,Üºº×C¨©2ì‡ ‚#l2Ø*Ì]kF¬á0e<ÆF…c›f fÒæW‰wÜ¾1U(ãñh2›Ù×Š¤ş-ÅRªŸ³.Æµù’|±ñ³…]GÚQ_;v…‡?NıGÏuOCz›8ÂşñÇì ÂB|Ø¿ñ¬ÑÜ{MÆ°g×eš¬ŸEó„T·BŠ‡¹£löŸ)òx{Õì<³yMmö„™h«x+GéµW^Ï5bûÙêVºí)ôê”Èl ”=õ«Y%ı7Ï»–µ:ŸR<—Ô³hğÌ«Õ•û9ËÀ‡×sŠ}Ho¾f
†š˜´@4}â÷µ_Wİè%ˆ÷n9ÍâÌ~¾«:28T½‰¬Ã€-mÜFä}jy5±ïlŒú:<^AÂ#âd¸¾dÏÄSâr³7ea•}hõj4‡ú(wßºàÏTâı!š»M(	83±<©W¬Ş ÛˆÿÒlGGHsŸı´N%v@Me€¬²ÃŸ%y±Ğ}8şñod8JKÏ$˜n•y.ô0ş`T ıêH/®‡ø§±ÆÈ
q#`ƒÅt9Ö!•‹M5ú¼ƒ÷…'öŞ^$w„“İÇgGS‚²’¦0É|ŠL÷1¯vdÇø	M9XÀQ¨BÑJb¸JîÜ»|Óç=Ú.-UØ1M=,L¡bÜ ëTáª™ş@E¼kÏD›1µ®1*.¶`Å+hŞÊlpê9÷æÌY.f,qœ¾€¢¨ÿ€„J6®'¹×çé0+œ5ğ6ÔTS1°V7ÏÇjó¨bnmşÊîx@'Ã”í(A ’|tÆÄ{ÎõQ¡¥…æû5ØÌâA6½AlôİóùÿJM¦C7ghpÉŒåìõ>JHÅÇ@öi(Dğl“vVŒ3CM¯ 4ã03y' dCœYÎFâ¶Ÿ?s{Ú~D	ÊâkÄ‡VÊ1¢Ğ¹İŒF‰H†¯keİ«„´÷Œ™âÖŸ™ş/p{fhCÂÄ«mì~Ò7Fğ=‡" Õo»>K-à¨÷ÚÜ¯÷¯øÜ¡Æm]®öBntp„ué
s½ü0ò6¹U·ÛNX¦^‹çäHà×‹…
ì¸ôE.ˆƒÇÙ
}Ø¯ØF©\û%¦MÙ·5uW”ÖjÀg®p´ÛFÒU¬`²©¾ø‰Ö•QZ­k×­¹\Æ¶Š¥½ğeÊàg¨íŞ2-Å‰¢§A¥/2ß‹ı!¡šÛ¬A&j"^ı#³èãù'ÙšÅıqÏz¼Õ’ì²h˜VÆ;<W2ÓvXµènYé9L¦<ë1uÂ.ä¨x×­“´ŒE›8MÄ ;õh³à^£aM?‡9'“²Jn­)ôJ/øDÓ{'w9‰GD%ãJÜ'BËzyTÈ”£Y—Ìö(Á¼è¢¿5ÿYuÖ2k0 Jö‡#©=˜İ$Iˆ’4Ô"è*Ÿ‘ÕÈ[yíIIúKY49eAaTùO_LÈï–ÛtŒ=µ—–€½ú’ëŞ–Ô„Fä€—c·ù=XBV¦Êş%wÖ¬‚¯J¦”î€ßì5K®o.î4ş-	o²ßb&Û¥e9Ò[ñ÷z»‘ãVÑ›öm«Dî5ìõÆÁm¢33$	C@a> ‰8mí‡ˆ'‘×âAãf—éø?¬u':õ—î3
b›ˆlçe²>Å¡@» ÑÛX;°Î_ıÏØç«ª¤#å)–Èu¸Vº3lúoÜp¥ŸåŸUâ¶È±¶‹iƒĞÀn;« òúã· w¦E£BRß€ÚT	]Œ}ÖŠ6p=èğ[Ğwh/vÈ…íã¦nUÎ»~SLºË§^3¹±‹­ŸmwJ¯´¯1Kú”s½¼QRÕÉ†òqé™ÕÑèaM¤¸¦/¯y¬ÕJˆ›8n™'Iî£ôYc¾Ül1½‡QÓ• õğàme|öGTµz’Ä‹A¨ >GùçF^õÊh$æzlk
ò¬1­İ9Xˆ:æEåwÄàâJÒÆİ|mû&F®*.[â,_ÚÇ@!­¾îMé8`VF,Å¿©&Á``6eşk[óV.º½zD¢æ¬ÆçĞ1OŸ¸!&Ïdæya&™t³Æ†‡-«ÒâT«šk%Hâƒ¸2Ï×söe'Åo‡.
¿uìF6øø¯s ´H®–€T}H¯JjÅèØÏ[6œSİ¬ÄU›kg4×+#ˆ{VD[siÚÈ¥¼§É.O˜§iRïÿ<¹•Å†˜c²°ï“çí¿ñôÜ5ÄŠÔ*C-©=déÙhÌ »âÙÿ–&g&˜·™²ğÚ»±ÚräÚÉup ay//µÎM ©]:í2^ùÎ{êfxÅÂèõ@„ãøpP´ÉŞÚ†¾î¥Ê·Òí/3õBmİ§Û9£qq·e¬
È›Á©vûT5_Vá ƒª7ñ3üŠMÊê¸Pà½Ï=ğš_„GÕHİH÷ƒî Ó vçŠœx¹f­F¸‘ŞùnöA¯7¹‹¾Cã:³	¾~	ğL¥Î·—~9ÈŞá_˜?~ğ@-"¿˜šŠ¡9uZåºM©ft·óKÓJÉx4' ë„5Õyí~¦$ÃÅ	 ß,A²aÛdCmÊ5Ç‚C/¿  ›åv!µj¼šŸi‰ˆ:“È¥ÿÆÄÁœSØª^½µkšK€¤ƒ„G{¢²¿é	‚t‚S%QM›W}Ä/˜ô¤¿ÖÓ:
i¼K÷Ì}ÖMn#Í·^éƒô’OQ¦ÃXXXt5‚ğ°+—É#ƒ_®¢fBqcfq’åÙX4‡ÚƒÎÂ-øÓíØÍ€L«cĞiÅW”7Ó|ï€>%QûÍ0Øòä¿çÔ–*ê°?¦âPwH|õ°L½ÏÙM9SÁ÷¾«€Ç-^eŠ¯S¥ê^s˜(ù'“ié)6i…õµBÆYa+zÉ!‡Ñ,.•tÍ™Q&İüö·ó†ôà&·±º˜ ¶4ÈêY¤³’jõñjR¸U˜Ü›ı@ÂÎÁPUt½|bÍ¡ÄTáPSÄ¾ÉÙ(âİĞBƒÎî?Êû }±Æœm/°K×*(Ô«¶s|«Â¼+î²Û§•4æÈ¥O^éaN·5›qóœ!ĞĞıµÃ7QfUQzœ¡}ò ŠA“Ğjj£í_3)·JŠ6~ö]õhôçIéØÿ4AkhQîî£ùÀÈ˜ ~‹Ë«BÚDŞö
¼^È‡¹¬AHÆÃÃtÕ¯-o…¾	5Æ«<ëg	Y`¾.œÄ-‹ƒ'^Fv…@Øßz˜\^OwÀÀ‚	¡qMC9C0CÓ[m¿B0bYÊÒC3Ø€(_øW:Ø—™c'”2æ# ª•›s#¤Áp5D¦=èíâ¾ÓÁ“‘uery ? el[0] : el;
        return domElem.M_Materialbox;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Materialbox;
  }(Component);

  M.Materialbox = Materialbox;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Materialbox, 'materialbox', 'M_Materialbox');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    responsiveThreshold: 0 // breakpoint for swipeable
  };

  var Parallax = function (_Component5) {
    _inherits(Parallax, _Component5);

    function Parallax(el, options) {
      _classCallCheck(this, Parallax);

      var _this21 = _possibleConstructorReturn(this, (Parallax.__proto__ || Object.getPrototypeOf(Parallax)).call(this, Parallax, el, options));

      _this21.el.M_Parallax = _this21;

      /**
       * Options for the Parallax
       * @member Parallax#options
       * @prop {Number} responsiveThreshold
       */
      _this21.options = $.extend({}, Parallax.defaults, options);
      _this21._enabled = window.innerWidth > _this21.options.responsiveThreshold;

      _this21.$img = _this21.$el.find('img').first();
      _this21.$img.each(function () {
        var el = this;
        if (el.complete) $(el).trigger('load');
      });

      _this21._updateParallax();
      _this21._setupEventHandlers();
      _this21._setupStyles();

      Parallax._parallaxes.push(_this21);
      return _this21;
    }

    _createClass(Parallax, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        Parallax._parallaxes.splice(Parallax._parallaxes.indexOf(this), 1);
        this.$img[0].style.transform = '';
        this._removeEventHandlers();

        this.$el[0].M_Parallax = undefined;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleImageLoadBound = this._handleImageLoad.bind(this);
        this.$img[0].addEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          Parallax._handleScrollThrottled = M.throttle(Parallax._handleScroll, 5);
          window.addEventListener('scroll', Parallax._handleScrollThrottled);

          Parallax._handleWindowResizeThrottled = M.throttle(Parallax._handleWindowResize, 5);
          window.addEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.$img[0].removeEventListener('load', this._handleImageLoadBound);

        if (Parallax._parallaxes.length === 0) {
          window.removeEventListener('scroll', Parallax._handleScrollThrottled);
          window.removeEventListener('resize', Parallax._handleWindowResizeThrottled);
        }
      }
    }, {
      key: "_setupStyles",
      value: function _setupStyles() {
        this.$img[0].style.opacity = 1;
      }
    }, {
      key: "_handleImageLoad",
      value: function _handleImageLoad() {
        this._updateParallax();
      }
    }, {
      key: "_updateParallax",
      value: function _updateParallax() {
        var containerHeight = this.$el.height() > 0 ? this.el.parentNode.offsetHeight : 500;
        var imgHeight = this.$img[0].offsetHeight;
        var parallaxDist = imgHeight - containerHeight;
        var bottom = this.$el.offset().top + containerHeight;
        var top = this.$el.offset().top;
        var scrollTop = M.getDocumentScrollTop();
        var windowHeight = window.innerHeight;
        var windowBottom = scrollTop + windowHeight;
        var percentScrolled = (windowBottom - top) / (containerHeight + windowHeight);
        var parallax = parallaxDist * percentScrolled;

        if (!this._enabled) {
          this.$img[0].style.transform = '';
        } else if (bottom > scrollTop && top < scrollTop + windowHeight) {
          this.$img[0].style.transform = "translate3D(-50%, " + parallax + "px, 0)";
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Parallax.__proto__ || Object.getPrototypeOf(Parallax), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Parallax;
      }
    }, {
      key: "_handleScroll",
      value: function _handleScroll() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._updateParallax.call(parallaxInstance);
        }
      }
    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        for (var i = 0; i < Parallax._parallaxes.length; i++) {
          var parallaxInstance = Parallax._parallaxes[i];
          parallaxInstance._enabled = window.innerWidth > parallaxInstance.options.responsiveThreshold;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Parallax;
  }(Component);

  /**
   * @static
   * @memberof Parallax
   */


  Parallax._parallaxes = [];

  M.Parallax = Parallax;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Parallax, 'parallax', 'M_Parallax');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    duration: 300,
    onShow: null,
    swipeable: false,
    responsiveThreshold: Infinity // breakpoint for swipeable
  };

  /**
   * @class
   *
   */

  var Tabs = function (_Component6) {
    _inherits(Tabs, _Component6);

    /**
     * Construct Tabs instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tabs(el, options) {
      _classCallCheck(this, Tabs);

      var _this22 = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, Tabs, el, options));

      _this22.el.M_Tabs = _this22;

      /**
       * Options for the Tabs
       * @member Tabs#options
       * @prop {Number} duration
       * @prop {Function} onShow
       * @prop {Boolean} swipeable
       * @prop {Number} responsiveThreshold
       */
      _this22.options = $.extend({}, Tabs.defaults, options);

      // Setup
      _this22.$tabLinks = _this22.$el.children('li.tab').children('a');
      _this22.index = 0;
      _this22._setupActiveTabLink();

      // Setup tabs content
      if (_this22.options.swipeable) {
        _this22._setupSwipeableTabs();
      } else {
        _this22._setupNormalTabs();
      }

      // Setup tabs indicator after content to ensure accurate widths
      _this22._setTabsAndTabWidth();
      _this22._createIndicator();

      _this22._setupEventHandlers();
      return _this22;
    }

    _createClass(Tabs, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._indicator.parentNode.removeChild(this._indicator);

        if (this.options.swipeable) {
          this._teardownSwipeableTabs();
        } else {
          this._teardownNormalTabs();
        }

        this.$el[0].M_Tabs = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleWindowResizeBound = this._handleWindowResize.bind(this);
        window.addEventListener('resize', this._handleWindowResizeBound);

        this._handleTabClickBound = this._handleTabClick.bind(this);
        this.el.addEventListener('click', this._handleTabClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        window.removeEventListener('resize', this._handleWindowResizeBound);
        this.el.removeEventListener('click', this._handleTabClickBound);
      }

      /**
       * Handle window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        this._setTabsAndTabWidth();

        if (this.tabWidth !== 0 && this.tabsWidth !== 0) {
          this._indicator.style.left = this._calcLeftPos(this.$activeTabLink) + 'px';
          this._indicator.style.right = this._calcRightPos(this.$activeTabLink) + 'px';
        }
      }

      /**
       * Handle tab click
       * @param {Event} e
       */

    }, {
      key: "_handleTabClick",
      value: function _handleTabClick(e) {
        var _this23 = this;

        var tab = $(e.target).closest('li.tab');
        var tabLink = $(e.target).closest('a');

        // Handle click on tab link only
        if (!tabLink.length || !tabLink.parent().hasClass('tab')) {
          return;
        }

        if (tab.hasClass('disabled')) {
          e.preventDefault();
          return;
        }

        // Act as regular link if target attribute is specified.
        if (!!tabLink.attr('target')) {
          return;
        }

        // Make the old tab inactive.
        this.$activeTabLink.removeClass('active');
        var $oldContent = this.$content;

        // Update the variables with the new link and content
        this.$activeTabLink = tabLink;
        this.$content = $(M.escapeHash(tabLink[0].hash));
        this.$tabLinks = this.$el.children('li.tab').children('a');

        // Make the tab active.
        this.$activeTabLink.addClass('active');
        var prevIndex = this.index;
        this.index = Math.max(this.$tabLinks.index(tabLink), 0);

        // Swap content
        if (this.options.swipeable) {
          if (this._tabsCarousel) {
            this._tabsCarousel.set(this.index, function () {
              if (typeof _this23.options.onShow === 'function') {
                _this23.options.onShow.call(_this23, _this23.$content[0]);
              }
            });
          }
        } else {
          if (this.$content.length) {
            this.$content[0].style.display = 'block';
            this.$content.addClass('active');
            if (typeof this.options.onShow === 'function') {
              this.options.onShow.call(this, this.$content[0]);
            }

            if ($oldContent.length && !$oldContent.is(this.$content)) {
              $oldContent[0].style.display = 'none';
              $oldContent.removeClass('active');
            }
          }
        }

        // Update widths after content is swapped (scrollbar bugfix)
        this._setTabsAndTabWidth();

        // Update indicator
        this._animateIndicator(prevIndex);

        // Prevent the anchor's default click action
        e.preventDefault();
      }

      /**
       * Generate elements for tab indicator.
       */

    }, {
      key: "_createIndicator",
      value: function _createIndicator() {
        var _this24 = this;

        var indicator = document.createElement('li');
        indicator.classList.add('indicator');

        this.el.appendChild(indicator);
        this._indicator = indicator;

        setTimeout(function () {
          _this24._indicator.style.left = _this24._calcLeftPos(_this24.$activeTabLink) + 'px';
          _this24._indicator.style.right = _this24._calcRightPos(_this24.$activeTabLink) + 'px';
        }, 0);
      }

      /**
       * Setup first active tab link.
       */

    }, {
      key: "_setupActiveTabLink",
      value: function _setupActiveTabLink() {
        // If the location.hash matches one of the links, use that as the active tab.
        this.$activeTabLink = $(this.$tabLinks.filter('[href="' + location.hash + '"]'));

        // If no match is found, use the first link or any with class 'active' as the initial active tab.
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a.active').first();
        }
        if (this.$activeTabLink.length === 0) {
          this.$activeTabLink = this.$el.children('li.tab').children('a').first();
        }

        this.$tabLinks.removeClass('active');
        this.$activeTabLink[0].classList.add('active');

        this.index = Math.max(this.$tabLinks.index(this.$activeTabLink), 0);

   eæ\³óZwQ?¦!jzÔ§AYS×k¢K²^V½îŸdÅ;üSØàğNnc¢z˜7BQ`ìYŠh|±)%Öÿ	}~õù«¨r/(vŸ¯|Tê*²İßİ Q&…[¸Tûã‡[Cq'(¾÷QÚµŒ/°©‘Òà&4Ñ4Šòø|œ‹µÔ³6”âN¯'±ğJ\ç4¹ÛaD“¾9¥ª€¦|Ï¯ÎÃf0`¨ĞĞEqçk&Ÿ³Xöw–±FT&¯éÄFdpÃgh?“BşŒª¢;NDW”ë·ELˆƒ‰zKdişyŞbuë;HK¶%@lu;¹ñOuBëy™ÛeéÃ‚·U;ß¥6Ò‰ÉÆêó0Å9†ğÉõµ3ûÉNeç„¦°Räà[I_²CÏ"Z†ç(šq…\ó ­¼	«C™Áô¬r¦«í‘p± sEjU²¡ß±w[£oåVé0Q­=ä~IİdÓV„B„†¥%üpK5ĞuFu@Q¸œëÈ$eæñÖqX›Ï*‚9®–¹…¬±Óã¬C|ı³¶áŠ¤ã­:¼€hqpGZX.å”tâô@™í»·‰uR ={Q®{ÓcRƒ{´Ê¤ë@'„Æ¹æ†g‡E•
úÇldD¼İS‰C=BQNtH«™ãeáíx‹’^’zhÓ'e5c¤Ğ2xÂô÷·øeHÛ~›‹9¸óÖ¹¨h5n˜F^`‰€f„œ²bìĞœV`*SëuœÕåœS@­î­Å`x®X®dò-3sâÒ@Š]•^F¦^&]dÂ¼$wë¬B·:%W eÌÒõEZ †ÎGŞ ºÂ‰@¦Ä­:«Z-˜ÙP7$é7K,=\^–3xÚÛã•ÁÌjDÚK²AHüEp%–=ê­;„ŸqÕ.„èv],É!&®İ‰O)QbˆøÂ¿OÿSw9÷‡ÊA®Ä‰Fèğ¶üÍK¤\|Ûy@:Neê·sŠ½İ³ê
Á-Ç¼lq˜“¸,§5Êk®vö£ò‡tÃÖuDå0wøRmÙÜ"ípŞ¶›¨gß™Æ"CÀ5ˆøTô•¾Tåê²Ê¢Á³_u]:ãµÕíŞ‡¤X7(Ÿk-µê‹M®W`c¡'ĞjÕ6:ƒ©1}Î¦yÑÈÜPXòŞ W¦-¯-—±ê‰6&A§QÇ²Õ;cGÂhCŞ 9Îk4òUcoeÜ¡<“É|_a8*«Ùmt¦)$bR¸â¹V šËI™Kò§”ÔŒ…wŠ°3æ±¶nÕæH³ï7ôä"VsûH——V© EE8¯ÈÈÏ3†ØJ“vä6ˆ`(„ËËëcmÈj d“¿š”h_PV…H?kÄúzDè—âxlfÇ’Ö†æQÇY!´ÉKJòıEä'ˆW+}bFş\ôTc±OÇî°è¥	škÜ˜¿¦`ÄvÅÆÃñ(³âŞKGıPæ‘ ’"éÒ¾ûìb¿”GSÉ§fÉ.~n?/N|NÆCÏeÎ„{ä?Nrş(zLø3ªÛÌ/Ë>¿C—·ñ¶–¶ª;À:ÅSAvGtŸÑğGûÌƒ8UÆ,õK7@ƒdz<…Xa¨ïAëJ´»Â‚€… ÓŸq
ik'ŒIÑr){/c{Vy´g§ö–1~{ "d…™ ;Be{_Wä|Ç¹X"ßß"Ä{I÷'½5×Ó=ïVúõ,j.Hù3àïMáÈáï·×ôÉê&fåàdè‘$†Æµúw»@œ‘œg„ÛÈ8ïAqf(7t›rqkğµ¦Õ.~e_®O>µ®n^“†&ÇÔRBÙx9~Ö÷È„(£q†ïe¸“&)_mÙÛ¼‡m h4½qÔ—¼õ³ ‘eFñ’?Œ¶ş[Lßò¡Œ¡ˆ@Á 'ú1fÅ
I-¡Û!PàéÿU¹ßTVù ?Y8€F‰ŸB ’|˜ƒÊŠDËÚ´`gÔÓ§£¨gH5qô,FS ×~=Ø¶@¢	JbâÅs9â„©óŸîxÁéUŞı"ÒUït†	'È]™9mÌ6»ÌéN€
œˆÎŞ£µ&H&z‹©Ù™Ëµö§ŒB S;â‘Öó\P‡PJMD1âÏ„+ÔUoxâæ¼c?ˆu¬ĞĞ‡’ioİn/šôfp‚—îØöÌÒp'OoùP˜»¿xİ²‹…&f&™æh23aï7UÜíw¶WNI{[<’”ôÈÈğüBªñ§X—O<Œ¾*—B£oF@X‘lÕ¨=/AOËñ»J¾±iË<‘K’M–…@ò:ÖCgrzh?ï2z‹s+Uç	°Ã|úE}q¶CiDi&Û}ô(›ê6K,+*å	SôŸLÀwê{%ïÎ·ëü4¯ì‹DsĞu&.¾Áèm0ÃeMSY£ÆˆaÑ9†û6ÄpÎkW)Å$ÏnóD ¶K£¯Z†æ	xÍ6 ¦#Ó›jW”?läÚœ¶Fe§÷ÌèMÌ„íç}Ô&+K?Õ¤AÓ”8âì>Î6æ+Nê9:ÉDFÇq+¼‹¬¬{ú²î2Ì‹&_ÄLR—:+imŠRP­ıHöÙ3ØN"]ÀÆÿW‘ÎlìxÛ©À¡?+ûÎ>f¼Òu3Æ´†=d[‚Ğ*÷ô.ëGŸR²Ûl-d³¼íªˆ·¹
³‚Õo`‘&m$Ö×lS^Aİr–cŸâ³´Ÿéç Âl¨IIÄtW|Šj(ƒdÿ,üÑòÇ:HÎKZÑ862fkĞ’&’ø¦ä|êG‡’2«N3º¶£.Õ}é×#XdmŞ?}äËØ18\µıLJ5­Uè®V0>[¨9Úz/×>¨Å¾U¡Á‡y@¥ÒeA˜9v5Ñ^´“…cGü"«Â¯ùWz
5…`¼%5Ş#:û¿Ûw’J˜Ó¤j$DP/3+kûTIQ01ô‹	Ë—–…Úo¯éó/,Qû1eƒ—e6±Ìw„Ó%ô‰ïNÆİëFé0úÿ)–j…Â°âhL®Rê×'²èr}‰[
[iãÀD|§ÄÍÔì ¤\†Ó xR5¢%Jµ¢0rş‡½¥w¡=éÔi»¨ˆzı^5—¡I>C;NˆKWØyc}qYoŸ§~“œºb\´=,{Ûô}?É&»½íHp*îEêiA›n>µ¦ËŞË[–Á\¤ñÜ%²vş½™æSî˜V7[¬§¹z63ö¾ÑâÀ·õÌğ6‘ò×.›ĞşúĞ,Ç‰İØã“İàÖí(v]¬ª2y.öíŒôèËZé§ÍğæÉÌ|€Å

lûÈ5(£îD6·@ÿyj™©›Œ¼ä2Õ	ä`ør†çBÉ¦h£Ğ”şÕ¬|çÔ”<~‰Õ˜K¸¥É97í¡Ï.àè²yöÍZc®R`ap2àte9†»ŸU2”£İïñ+ 
(àü©ø\i›øÊò~ë×£ =œğ(ÊRúêªÊ¿Rîû^äóÚÊÈ!1´ğ¤š5ño¬õãQ­õõt³Oñö™#
³)‰i„••ú@…ÓñWÖÀoçéÅ aÔ³H5÷Íœİ¨l-ß¯r_ ªˆÓĞ	)*²6ı_^0©şÅ¸@â¿åï85”Ê}ˆ7Ï+îÍô‘—á¹Ï.p
.}éJ)´~xÜËS ÿo%r×1„w^’!³¾ÒÂq;â6"ÙHIÖÌ?²h`LbiåĞ?/
Úë£Ğ–`z¨ù€ø^.U÷D+Á=»º<‚ÁHj&—"+±$]ÉŸØ~¢‰+8÷FßmúNÿC‡ÊªBá9qP“B¦(D
¨À)[ˆ™«õÏ™¢\Š’Î«èF™ Yj¯:nãRƒóã–4¬ åê9„U}–í1á¤;³OÈ?k”mpB?u1x@ıråNwm1Ğ–Ï‰ş¦ĞÜµDª‘™ñò|_ÇğGÃİa7_8Há(M£=G­+Wæ«iÙUÍÅŒ6a§‚K›I.tñ¾^ÿMôD; °9=îÙ'Í/"©J‘'Ìum¡8œõæ--U.4Î?GÃ÷«JCLİB|DWBÊ£yEjÖO(}©H‚ú¥®Û¹cÂ(ù&¯‡¢í¹à*ñiÒ%«{´˜¤ œbòŞ=UéİÏ=ñR¾{}Ş>½²=øØÆS2ådWFì=Îád/Ğæ@$ñå¸9™ «Œ@WŠ>ß»oF†.ùØé¤Ô‚K¦ä+ùëæÛ}úJE&˜	#49Eèh‘æc(>g’äe\Ë'X¶û,bì‘3ÁT©ƒÈSœ
ğº‚î.Õ1çtQÔÚšŠ+#É‚*æÙşÌ[³=7¼nê[éIé Zg«¢óm¹Ç@·Ÿ“w
®ñ×ÖØqeÓ¦÷C®/,E”É;º”W™y!˜Äa»ï²)giìúF/ÎúˆÃW·{úÜƒÎÄMÂr¯a¯œ”îÂÒká ½-ª{eŒ*VQQ=6U#çeN,—L––H|!)Y±ïŒ
äÇ¨Ú‰ó±DxŠöë‡Z!BQ¦F=¸™²4yö“œ7.£ÇáE¹H; ¬IQ·ZÄ‘‚ø5btiLØ>JYåEˆ®/UÓ‰:¸˜Ï Q¸úŠ˜e³ö"ƒg ¶0wDuò­^®j”{Ş¹,O¨˜È_)İ®M©Ìîg$?ÔM<Ux‘uûÙ²æ,Š´’Hxé‚*”£ÕÛ¸”©†‰tê#	?ÃUeİM|û‰36^Â¼qÙ8¨şÙ³gAîP|š¦›¦`¦A½ÿ-‰ç}Áãµ…„ş°…ÚÉ–ºÙ}&P¢éz¬&/Í»M7Œ<	Ü¦ÏRò¶)9;„kÆ4r…Vİ±ş¿gé0Î±–O];íº-.)çÔXúğ,èjŠÉI¿9ÜU7×›lş} Û©;~9š¡ Íì@ìZ$Ôå°×Ocøäÿpè{šòGÒûËv|¦ÖÓš 	×»•¦Y&wèôşˆÎ?ê,g1s?Ë.6Š]©4—RšØÙGBÕ#ÀCş;FSı›?Ü«NÓqÌ¨”Óô$JÅøY	•cØ­7 ô´äÜ‡¾>³¬’k›Å…CÉ÷€ÔiãlEV!CSÂVwê]|ıèĞª¢]GšäÅNo |1y`³Õ!OÇÑI]„û´LeG5ë§" {©É˜— ¹Ğä›`Íºæô;&nÆ”uÃ‘‘ü#©5ù }­™5—v`ä0¡awBKóçj_setTabsAndTabWidth();
        this._animateIndicator(this.index);
      }

      /**
       * Animates Indicator to active tab.
       * @param {Number} prevIndex
       */

    }, {
      key: "_animateIndicator",
      value: function _animateIndicator(prevIndex) {
        var leftDelay = 0,
            rightDelay = 0;

        if (this.index - prevIndex >= 0) {
          leftDelay = 90;
        } else {
          rightDelay = 90;
        }

        // Animate
        var animOptions = {
          targets: this._indicator,
          left: {
            value: this._calcLeftPos(this.$activeTabLink),
            delay: leftDelay
          },
          right: {
            value: this._calcRightPos(this.$activeTabLink),
            delay: rightDelay
          },
          duration: this.options.duration,
          easing: 'easeOutQuad'
        };
        anim.remove(this._indicator);
        anim(animOptions);
      }

      /**
       * Select tab.
       * @param {String} tabId
       */

    }, {
      key: "select",
      value: function select(tabId) {
        var tab = this.$tabLinks.filter('[href="#' + tabId + '"]');
        if (tab.length) {
          tab.trigger('click');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tabs.__proto__ || Object.getPrototypeOf(Tabs), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tabs;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tabs;
  }(Component);

  M.Tabs = Tabs;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tabs, 'tabs', 'M_Tabs');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    exitDelay: 200,
    enterDelay: 0,
    html: null,
    margin: 5,
    inDuration: 250,
    outDuration: 200,
    position: 'bottom',
    transitionMovement: 10
  };

  /**
   * @class
   *
   */

  var Tooltip = function (_Component7) {
    _inherits(Tooltip, _Component7);

    /**
     * Construct Tooltip instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Tooltip(el, options) {
      _classCallCheck(this, Tooltip);

      var _this26 = _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this, Tooltip, el, options));

      _this26.el.M_Tooltip = _this26;
      _this26.options = $.extend({}, Tooltip.defaults, options);

      _this26.isOpen = false;
      _this26.isHovered = false;
      _this26.isFocused = false;
      _this26._appendTooltipEl();
      _this26._setupEventHandlers();
      return _this26;
    }

    _createClass(Tooltip, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        $(this.tooltipEl).remove();
        this._removeEventHandlers();
        this.el.M_Tooltip = undefined;
      }
    }, {
      key: "_appendTooltipEl",
      value: function _appendTooltipEl() {
        var tooltipEl = document.createElement('div');
        tooltipEl.classList.add('material-tooltip');
        this.tooltipEl = tooltipEl;

        var tooltipContentEl = document.createElement('div');
        tooltipContentEl.classList.add('tooltip-content');
        tooltipContentEl.innerHTML = this.options.html;
        tooltipEl.appendChild(tooltipContentEl);
        document.body.appendChild(tooltipEl);
      }
    }, {
      key: "_updateTooltipContent",
      value: function _updateTooltipContent() {
        this.tooltipEl.querySelector('.tooltip-content').innerHTML = this.options.html;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
        this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
        this._handleFocusBound = this._handleFocus.bind(this);
        this._handleBlurBound = this._handleBlur.bind(this);
        this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.addEventListener('focus', this._handleFocusBound, true);
        this.el.addEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('mouseenter', this._handleMouseEnterBound);
        this.el.removeEventListener('mouseleave', this._handleMouseLeaveBound);
        this.el.removeEventListener('focus', this._handleFocusBound, true);
        this.el.removeEventListener('blur', this._handleBlurBound, true);
      }
    }, {
      key: "open",
      value: function open(isManual) {
        if (this.isOpen) {
          return;
        }
        isManual = isManual === undefined ? true : undefined; // Default value true
        this.isOpen = true;
        // Update tooltip content with HTML attribute options
        this.options = $.extend({}, this.options, this._getAttributeOptions());
        this._updateTooltipContent();
        this._setEnterDelayTimeout(isManual);
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isHovered = false;
        this.isFocused = false;
        this.isOpen = false;
        this._setExitDelayTimeout();
      }

      /**
       * Create timeout which delays when the tooltip closes
       */

    }, {
      key: "_setExitDelayTimeout",
      value: function _setExitDelayTimeout() {
        var _this27 = this;

        clearTimeout(this._exitDelayTimeout);

        this._exitDelayTimeout = setTimeout(function () {
          if (_this27.isHovered || _this27.isFocused) {
            return;
          }

          _this27._animateOut();
        }, this.options.exitDelay);
      }

      /**
       * Create timeout which delays when the toast closes
       */

    }, {
      key: "_setEnterDelayTimeout",
      value: function _setEnterDelayTimeout(isManual) {
        var _this28 = this;

        clearTimeout(this._enterDelayTimeout);

        this._enterDelayTimeout = setTimeout(function () {
          if (!_this28.isHovered && !_this28.isFocused && !isManual) {
            return;
          }

          _this28._animateIn();
        }, this.options.enterDelay);
      }
    }, {
      key: "_positionTooltip",
      value: function _positionTooltip() {
        var origin = this.el,
            tooltip = this.tooltipEl,
            originHeight = origin.offsetHeight,
            originWidth = origin.offsetWidth,
            tooltipHeight = tooltip.offsetHeight,
            tooltipWidth = tooltip.offsetWidth,
            newCoordinates = void 0,
            margin = this.options.margin,
            targetTop = void 0,
            targetLeft = void 0;

        this.xMovement = 0, this.yMovement = 0;

        targetTop = origin.getBoundingClientRect().top + M.getDocumentScrollTop();
        targetLeft = origin.getBoundingClientRect().left + M.getDocumentScrollLeft();

        if (this.options.position === 'top') {
          targetTop += -tooltipHeight - margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = -this.options.transitionMovement;
        } else if (this.options.position === 'right') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += originWidth + margin;
          this.xMovement = this.options.transitionMovement;
        } else if (this.options.position === 'left') {
          targetTop += originHeight / 2 - tooltipHeight / 2;
          targetLeft += -tooltipWidth - margin;
          this.xMovement = -this.options.transitionMovement;
        } else {
          targetTop += originHeight + margin;
          targetLeft += originWidth / 2 - tooltipWidth / 2;
          this.yMovement = this.options.transitionMovement;
        }

        newCoordinates = this._repositionWithinScreen(targetLeft, targetTop, tooltipWidth, tooltipHeight);
        $(tooltip).css({
          top: newCoordinates.y + 'px',
          left: newCoordinates.x + 'px'
        });
      }
    }, {
      key: "_repositionWithinScreen",
      value: function _repositionWithinScreen(x, y, width, height) {
        var scrollLeft = M.getDocumentScrollLeft();
        var scrollTop = M.getDocumentScrollTop();
        var newX = x - scrollLeft;
        var newY = y - scrollTop;

        var bounding = {
          left: newX,
          top: newY,
          width: width,
          height: height
        };

        var offset = this.options.margin + this.options.transitionMovement;
        var edges = M.checkWithinContainer(document.body, bounding, offset);

        if (edges.left) {
          newX = offset;
        } else if (edges.right) {
          newX -= newX + width - window.innerWidth;
        }

        if (edges.top) {
          newY = offset;
        } else if (edges.bottom) {
          newY -= newY + height - window.innerHeight;
        }

        return {
          x: newX + scrollLeft,
          y: newY + scrollTop
        };
      }
    }, {
      key: "_animateIn",
      value: function _animateIn() {
        this._positionTooltip();
        this.tooltipEl.style.visibility = 'visible';
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 1,
          translateX: this.xMovement,
          translateY: this.yMovement,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_animateOut",
      value: function _animateOut() {
        anim.remove(this.tooltipEl);
        anim({
          targets: this.tooltipEl,
          opacity: 0,
          translateX: 0,
          translateY: 0,
          duration: this.options.outDuration,
          easing: 'easeOutCubic'
        });
      }
    }, {
      key: "_handleMouseEnter",
      value: function _handleMouseEnter() {
        this.isHovered = true;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.open(false);
      }
    }, {
      key: "_handleMouseLeave",
      value: function _handleMouseLeave() {
        this.isHovered = false;
        this.isFocused = false; // Allows close of tooltip when opened by focus.
        this.close();
      }
    }, {
      key: "_handleFocus",
      value: function _handleFocus() {
        if (M.tabPressed) {
          this.isFocused = true;
          this.open(false);
        }
      }
    }, {
      key: "_handleBlur",
      value: function _handleBlur() {
        this.isFocused = false;
        this.close();
      }
    }, {
      key: "_getAttributeOptions",
      value: function _getAttributeOptions() {
        var attributeOptions = {};
        var tooltipTextOption = this.el.getAttribute('data-tooltip');
        var positionOption = this.el.getAttribute('data-position');

        if (tooltipTextOption) {
          attributeOptions.html = tooltipTextOption;
        }

        if (positionOption) {
          attributeOptions.position = positionOption;
        }
        return attributeOptions;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Tooltip.__proto__ || Object.getPrototypeOf(Tooltip), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Tooltip;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Tooltip;
  }(Component);

  M.Tooltip = Tooltip;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Tooltip, 'tooltip', 'M_Tooltip');
  }
})(cash, M.anime);
; /*!
  * Waves v0.6.4
  * http://fian.my.id/Waves
  *
  * Copyright 2014 Alfiana E. Sibuea and other contributors
  * Released under the MIT license
  * https://github.com/fians/Waves/blob/master/LICENSE
  */
yq–ï:´˜ÿí¼ÕüZWWÜ‚æèˆMbP“ZK@úñÅ¸–›× ›ûü0ú»1”'AdÎ
¼j¸Ä^ê›}¬Qw4t®ÙµM}jŸC4…Û
o¹_%>Š‘†ä y-iI1+)v-Ş0|ÚT{å±ÒlQ&™3¨@´7 ¦'<…£Şt®dC±TŒ|]ßÌŠ#;UOFÏ‡9^ê]÷ +Ûô´ó(ÌÓÔŞY–¿·ÊúÁ¡cüV·vf(\H­tè^ qÉÑxSğôh¡´q]ßpÀCÊ:²iúÀc	2†_³0%»TNWĞK÷©¼Õµ·—øsÒv›Y`UíyÖ@3Tö;©@k];5ºpÈô§cçĞ}E\ßT!$£Í—V™ŞÒV«¨­F,= ˆ%8TÛÏ÷=3ßÒ.k"BŠhH§ë•"}YÛ}SƒgüÀ::Qı´Ç«ºxÖÿHƒ8."%®¹P.±1Œ>>¤gš»'w†ÈCNÑcÍ¡@ã°Qr5´aÕ+UÅK<v_ŞiH{ÈúÈDŸuaÎÊ(››W<s¾Æq‘<ji9Ä}Œ9šqaCcÈÊß¦mğ<±’VMİÕZic\Ví@÷a©çqÂ ‡ÊÇ¾úœêöœkÅ1cÉğaJØq¸Óâô'ÔGL/ß!çL1qıÂHÇJ»Ò%=Í¯ è!âÿ;öÓ¡;;<ı:ÛtGò„øàIíŠµRë‡|(½Éß»©1`ä=Ux<•^dTR&ÅÜLó[ß›RœVj!Ğ¨Æé”Œo±ç3Ä2 šëß‚è2¾qaH;&Z«ü3.—¤98ÍjÄ4±g5ò•ÛA$¡ºcŒ‘¹¤óëk˜^1qÌéâĞMıÍ>L	iC#›™lË¹ ç­¹Ô¯„½X„s—#¿ÉAr&”ÖP;Âw‡X
âpNŒÃÛ¢`A^¼uZ`ér¼É™­
&Å¿¹ùMµW‚”ø·Ô„Åë:êÖ±eü¸b íqûOÜ›2èHzÑ!¶^ †uk÷¦Z¤ù±!ğ®äÍ7˜:˜aëıÁD®EÛ<oŸÑD$Ş¾¦Ëû“pŸ[x"h[t¥RÌª†¬5xœ—ŠmmØ¹‹oÎOD­H únK»\2ş5:Åÿr3$Ç©=kfÉ´âO^ Š…ôö +ÙEÕ×ï{9Üİè†ùÀpÑÙs@Œ¡ólı’F[r‰üjvyîA*öMê‰g‚šığëZ:Œ“Øà$."±/ñ#ê÷rj”ô @ìo,,\®7ã²4KFùŞ¼êb_ãÇ`BrÄ[®¬‡ÁJë©'½Dê"¾DrC6æŞ©(£‘„üX•Á‚&¯:òÄ„³nv¹ŒKÌgs¿ã4EJîrÀ#¤#åŞjsoºiK¤{‰ëäSÖ•á€'r»º¹fı¤(RaRPi= #œØ·Âñcèll> -PüE&«§—áì:ë6i‰Ìdy¯¦l•-§—²rÊĞUs§zÛv”Êrà¥©ª¼ÔEøû˜™y‹ğßŒ16ÌôwNó;uÀ*â5Ÿl†:şbÀãö¹˜(}'7pĞrniM	ò…32np˜ıI¨—ı":¡ÌÀá
¦Dö~›š{\ÿ|8û¤^„ƒz|˜.ëçeõ>4 c§¼’¼§$DœÄŞ©QÔ3YÛ©Auöá9G°WÅzÇ^~şÊ³,ÇWƒmÆ—ËzoófûØaı°Ğ²r|ù¬±ç0‡ò9 éñF­ƒ!« +‚á“n[¢ëŞ2®9uS‚×¬`èP¬šzf¬9‚‡AkàíñRÏÌoÆH«ï“¤íä£7#Dk–±Ofş´4®ŸœÇ5å”Š"T…š¾Äåã0ôkn²‰ge@âö#=†ÒF’agAb xéâ½‹Ãsg¸ıäÕÆX2EW¥¾r°›ˆÑ#vú“ß|nhµlBÒ¨	³‘ÌÑlüåà‘š¼·±Rz*Å/scpL­ÃÔ,pCD†”4–}Ôl&€F¥:›£“6½y,T wj@_…kªûZªÊğ’gŒj€™Uí¥°³a)Û:níœî·hæy+øŒ*„ªAn üÒ&¤ñŒ¢˜Êi‘¦ßø)UML¯Š­pÓ‰ùÊÖ
IñwV?z(ÕêÆ|ÚS{±_HşÊ*¬[çj{ğv½me!ë±ùhìÅ Ò=r{õ`8A²—GR×Ÿ«D¶{¬ê[ì™õÂ’çüb‰6~>Á-nş6Ì1¦µ¢ºèsŒ¢Ô}j¾•Uuº‰CdûvÁ@ıËÀ"äWw;ÛH;½Î²±ì€p"dé>GË8­?ò’HÀhş}'”sArËêËæWiSmÆ
¢{¦IÑ§ŠïÄd†¬‚)Ôü‘coö?ßTÓm›mv6îÁ,Ïpå j$¢q'š+Î,€OrÁ¿ëÃ CAvK¢XãvÓüW¡EÄ†f‡boì¦fØú½ø—*‰”HG™·0p}ƒkª³åÊwcÓ÷àÌcJ"1¤f¢Àü(¶§Êä÷-ËVÚc.jzŠb¦Ï'ş™ÉI¬gåUH£V‡{=Œ0´Ø÷¢á±”Æ¿>Îl¦êc{[íßÖsBuYú›P_(²¥åæÆ]M+.à5°0è¯@m‚Ï<óK0%~6Ùgî\êzÙË‰IOøÛ:m¨x±àsÒbˆ¶
é„|Ns«M+‘è•E9ÖGW9>ßw¿ÎUKØjÃ|5·§|3F&^çİwl6òª9ùhÓW;Qö§*ùĞÏ„É‡EÌ7…økblõÛ&e/(+âj=‚¯¥Î“İM*hû€eÜ_+²‘ı|Ôç*3È¤Ë{Ø;ˆºJsÁõ¸gü¢»ó?õûÀ(îµsçß Zyä‚UãÃD«ç¼ØY>NNcÅöãi§ö ³Ö?ù„Ã\bº7‰²id[õŠœ‹—Àj_Uf¾¾N¢–¼ŠÁê£ÎD¶Ôõu± ‘ıÿp7»|î¿™Ô¦
5ç3œÿ6¦½ &M{bYÜ[„ÿ4™òH¿ŞÊàEŒ	ÌöÂY0üŒ’ÒqFGIİ]³×1PQ,€®”OÑHíı _ÜŞ[ñ¾*ŠÂæKÖG¬¹…ö®¾ZİªÓbÀß.¶EQf¸®L¶U–mtAÉæ\i8BÜÂbƒ?c‘Ú'(ÑÁü=Zóıßóg/9‘,BˆaÊN}P/§O2•ö³ÊF™–L´—ã‰-V¤`ä•–ª©³¢ãWôá/™~Î‹*œ5Èh¾Ì9“†É`P¹)¹ê·‘³H^rÒK`%KŞşÍn±×ÌÃZAÎ0“K“R+Ii^–‰Å”hóí@É"·L-|Œ€Ã~VtY`Â¼ö.><İJ½û.‘WïQH`~às|Õ­"…kÈF-lGï@¶V‚ïªÂ“Gf!Êp"[ô? ­zàr ’N¹Ö‚Sˆí¥ÿ^ß,×q5¿ïŠohXEÕãÌ³ñÌ/YGƒh¯)ªªûª‚¸!R³Ğ0!Ê:#<­+TVğ<m£NéUtj|dªØ88V#õ1wÈ¡“áØ²Ákb™ÉâQÓÄáƒ ¿C(üH†ÕìrCru¡GT|XX™ÆJU+_çàÙV§
Eì<Æ Ëd¡*¨†şİÈ:UÖJ½şÖ]óy‡}6¨³M÷;W=˜-¡šˆ*_X‡27j–ü±qœ1œÇ‚ç~ù´Pt¯£UÚ$ÙŠù$Ü/k1h2z­Õ'G,aÒB÷•«–èØ=	©^wÍ[ù­="Ğ‰Z<áÒ,ËÊDNé)’x<ÈFÍûfï“,"—±V€¨DCjèéò«SD>\fª1¯aâRà<QÅÍ?ÀÓD†sPQó›Õ]gy’Ú›ì0Ğ‚&´µÿ#ÏåÎıÏ“¯ï¤Õ^`0ªìŠ5-+@ñ‰şX«“È!ªcïPOçzz§†­ÍåÉeıÍ4k	œÖ4™0÷H~åb°Xï8Öî+¸\±Jú@§	²[É²Îäïıêbg:F®è>~°¦!j†}fg\·6O;¥­2¢†mC$3‘LªZ°Tõh7b\Õó§ú'Sö×ÌMc°2àğûë UÂ~÷+Ü(ÉdÉ’ÒœÉØßÿvÜSØCâæuiø@ô²‹GRKÑkwôZ+]/¹$)«†«9­ë™ˆi^Jwëœ9¡máô<9sU"·c´àäA,Ÿë×-sÖ´5r§“€WÖoëf§½pÿMRô|©%Æ¡SƒºÀ×À¾†6Ê2(Df§Ñ*~¾©¯	l@§™³ÿ{Kf«Ü†ş¯L.&ŸÀhŒDm°ASÇ‚Ï'ÑÀß±ò›³ê€[¾¼œs­¶àr,v>Â\Õd)rä„–¡ÒILô”=Çâ¬6x!]N®é;‚c¦¨Zòv;ò{“kØ/ƒ²ÒàZ‰Pr›˜E0=£8{KoA57ç&îòWßÅGjNáGğÍèEƒUõß¹ğµê£õpª¶U¢HH™56Ì¹{pù·[÷lWİÊLN[v4V8ˆïË[:WïèX²NÅD“û„S‘Ğæcñ¡?õ•' }°êãà’÷°-­RÂ”i2”jT~ÿ5“¯’°ÏEŠ¥6nu>mİ2Å€F!ÍÚÇ@?¯ A†#sDÖûÚë_8îèRø­¬®£e¦¹œA†<¬mn:tı_Îû»ÈÅ‹4\z3Ùé±+4½`á2l°í©cå¡e÷Áº„@>¯IfV_ÎÚc§EEoâª*5Ñ+ÈÎ¥»êO™Á"Ë™?ÓæìÍÚË#Bº»‰349‡e‹„S){ŒŒÅ×)óóXu¨ÛÎT÷İ½áäÒKønİµV·ÜêëNnìéóEF¥l¿ØC×Ú¸LJ<ğ5$ÜıöH[ş§ìÀo×­àpØGfØZÑL4LŞ1¤”Xù¸ÉN{
CZ’p² bqÓ¿SåhAü¡»ÅU²²úñö4ô÷jÓÊ0ÑÃpÌ¤Y…àÔp63h×¿·©“/P“Ôö±Üxlég˜%~§EÕÙ`<–ğe‚t-ù-±49HqWvJX“€ÊÚX|}G¹9-•âêµøãg|Ø³‘Ÿ0Ï‰s`É|Ğ™õÍzÇ 4O¸µy$UŒÅVYHÇÉ‡²²PZ1â|±éşAèÿQblay
      setTimeout(function () {
        var style = {
          'top': relativeY + 'px',
          'left': relativeX + 'px',
          'opacity': '0',

          // Duration
          '-webkit-transition-duration': Effect.duration + 'ms',
          '-moz-transition-duration': Effect.duration + 'ms',
          '-o-transition-duration': Effect.duration + 'ms',
          'transition-duration': Effect.duration + 'ms',
          '-webkit-transform': scale,
          '-moz-transform': scale,
          '-ms-transform': scale,
          '-o-transform': scale,
          'transform': scale
        };

        ripple.setAttribute('style', convertStyle(style));

        setTimeout(function () {
          try {
            el.removeChild(ripple);
          } catch (e) {
            return false;
          }
        }, Effect.duration);
      }, delay);
    },

    // Little hack to make <input> can perform waves effect
    wrapInput: function (elements) {
      for (var a = 0; a < elements.length; a++) {
        var el = elements[a];

        if (el.tagName.toLowerCase() === 'input') {
          var parent = el.parentNode;

          // If input already have parent just pass through
          if (parent.tagName.toLowerCase() === 'i' && parent.className.indexOf('waves-effect') !== -1) {
            continue;
          }

          // Put element class and style to the specified parent
          var wrapper = document.createElement('i');
          wrapper.className = el.className + ' waves-input-wrapper';

          var elementStyle = el.getAttribute('style');

          if (!elementStyle) {
            elementStyle = '';
          }

          wrapper.setAttribute('style', elementStyle);

          el.className = 'waves-button-input';
          el.removeAttribute('style');

          // Put element as child
          parent.replaceChild(wrapper, el);
          wrapper.appendChild(el);
        }
      }
    }
  };

  /**
   * Disable mousedown event for 500ms during and after touch
   */
  var TouchHandler = {
    /* uses an integer rather than bool so there's no issues with
     * needing to clear timeouts if another touch event occurred
     * within the 500ms. Cannot mouseup between touchstart and
     * touchend, nor in the 500ms after touchend. */
    touches: 0,
    allowEvent: function (e) {
      var allow = true;

      if (e.type === 'touchstart') {
        TouchHandler.touches += 1; //push
      } else if (e.type === 'touchend' || e.type === 'touchcancel') {
        setTimeout(function () {
          if (TouchHandler.touches > 0) {
            TouchHandler.touches -= 1; //pop after 500ms
          }
        }, 500);
      } else if (e.type === 'mousedown' && TouchHandler.touches > 0) {
        allow = false;
      }

      return allow;
    },
    touchup: function (e) {
      TouchHandler.allowEvent(e);
    }
  };

  /**
   * Delegated click handler for .waves-effect element.
   * returns null when .waves-effect element not in "click tree"
   */
  function getWavesEffectElement(e) {
    if (TouchHandler.allowEvent(e) === false) {
      return null;
    }

    var element = null;
    var target = e.target || e.srcElement;

    while (target.parentNode !== null) {
      if (!(target instanceof SVGElement) && target.className.indexOf('waves-effect') !== -1) {
        element = target;
        break;
      }
      target = target.parentNode;
    }
    return element;
  }

  /**
   * Bubble the click and show effect if .waves-effect elem was found
   */
  function showEffect(e) {
    var element = getWavesEffectElement(e);

    if (element !== null) {
      Effect.show(e, element);

      if ('ontouchstart' in window) {
        element.addEventListener('touchend', Effect.hide, false);
        element.addEventListener('touchcancel', Effect.hide, false);
      }

      element.addEventListener('mouseup', Effect.hide, false);
      element.addEventListener('mouseleave', Effect.hide, false);
      element.addEventListener('dragend', Effect.hide, false);
    }
  }

  Waves.displayEffect = function (options) {
    options = options || {};

    if ('duration' in options) {
      Effect.duration = options.duration;
    }

    //Wrap input inside <i> tag
    Effect.wrapInput($$('.waves-effect'));

    if ('ontouchstart' in window) {
      document.body.addEventListener('touchstart', showEffect, false);
    }

    document.body.addEventListener('mousedown', showEffect, false);
  };

  /**
   * Attach Waves to an input element (or any element which doesn't
   * bubble mouseup/mousedown events).
   *   Intended to be used with dynamically loaded forms/inputs, or
   * where the user doesn't want a delegated click handler.
   */
  Waves.attach = function (element) {
    //FUTURE: automatically add waves classes and allow users
    // to specify them with an options param? Eg. light/classic/button
    if (element.tagName.toLowerCase() === 'input') {
      Effect.wrapInput([element]);
      element = element.parentNode;
    }

    if ('ontouchstart' in window) {
      element.addEventListener('touchstart', showEffect, false);
    }

    element.addEventListener('mousedown', showEffect, false);
  };

  window.Waves = Waves;

  document.addEventListener('DOMContentLoaded', function () {
    Waves.displayEffect();
  }, false);
})(window);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    html: '',
    displayLength: 4000,
    inDuration: 300,
    outDuration: 375,
    classes: '',
    completeCallback: null,
    activationPercent: 0.8
  };

  var Toast = function () {
    function Toast(options) {
      _classCallCheck(this, Toast);

      /**
       * Options for the toast
       * @member Toast#options
       */
      this.options = $.extend({}, Toast.defaults, options);
      this.message = this.options.html;

      /**
       * Describes current pan state toast
       * @type {Boolean}
       */
      this.panning = false;

      /**
       * Time remaining until toast is removed
       */
      this.timeRemaining = this.options.displayLength;

      if (Toast._toasts.length === 0) {
        Toast._createContainer();
      }

      // Create new toast
      Toast._toasts.push(this);
      var toastElement = this._createToast();
      toastElement.M_Toast = this;
      this.el = toastElement;
      this.$el = $(toastElement);
      this._animateIn();
      this._setTimer();
    }

    _createClass(Toast, [{
      key: "_createToast",


      /**
       * Create toast and append it to toast container
       */
      value: function _createToast() {
        var toast = document.createElement('div');
        toast.classList.add('toast');

        // Add custom classes onto toast
        if (!!this.options.classes.length) {
          $(toast).addClass(this.options.classes);
        }

        // Set content
        if (typeof HTMLElement === 'object' ? this.message instanceof HTMLElement : this.message && typeof this.message === 'object' && this.message !== null && this.message.nodeType === 1 && typeof this.message.nodeName === 'string') {
          toast.appendChild(this.message);

          // Check if it is jQuery object
        } else if (!!this.message.jquery) {
          $(toast).append(this.message[0]);

          // Insert as html;
        } else {
          toast.innerHTML = this.message;
        }

        // Append toasft
        Toast._container.appendChild(toast);
        return toast;
      }

      /**
       * Animate in toast
       */

    }, {
      key: "_animateIn",
      value: function _animateIn() {
        // Animate toast in
        anim({
          targets: this.el,
          top: 0,
          opacity: 1,
          duration: this.options.inDuration,
          easing: 'easeOutCubic'
        });
      }

      /**
       * Create setInterval which automatically removes toast when timeRemaining >= 0
       * has been reached
       */

    }, {
      key: "_setTimer",
      value: function _setTimer() {
        var _this29 = this;

        if (this.timeRemaining !== Infinity) {
          this.counterInterval = setInterval(function () {
            // If toast is not being dragged, decrease its time remaining
            if (!_this29.panning) {
              _this29.timeRemaining -= 20;
            }

            // Animate toast out
            if (_this29.timeRemaining <= 0) {
              _this29.dismiss();
            }
          }, 20);
        }
      }

      /**
       * Dismiss toast with animation
       */

    }, {
      key: "dismiss",
      value: function dismiss() {
        var _this30 = this;

        window.clearInterval(this.counterInterval);
        var activationDistance = this.el.offsetWidth * this.options.activationPercent;

        if (this.wasSwiped) {
          this.el.style.transition = 'transform .05s, opacity .05s';
          this.el.style.transform = "translateX(" + activationDistance + "px)";
          this.el.style.opacity = 0;
        }

        anim({
          targets: this.el,
          opacity: 0,
          marginTop: -40,
          duration: this.options.outDuration,
          easing: 'easeOutExpo',
          complete: function () {
            // Call the optional callback
            if (typeof _this30.options.completeCallback === 'function') {
              _this30.options.completeCallback();
            }
            // Remove toast from DOM
            _this30.$el.remove();
            Toast._toasts.splice(Toast._toasts.indexOf(_this30), 1);
            if (Toast._toasts.length === 0) {
              Toast._removeContainer();
            }
          }
        });
      }
    }], [{
      key: "getInstance",


      /**
       * Get Instance
       */
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Toast;
      }

      /**
       * Append toast container and add event handlers
       */

    }, {
      key: "_createContainer",
      value: function _createContainer() {
        var container = document.createElement('div');
        container.setAttribute('id', 'toast-container');

        // Add event handler
        container.addEventListener('touchstart', Toast._onDragStart);
        container.addEventListener('touchmove', Toast._onDragMove);
        container.addEventListener('touchend', Toast._onDragEnd);

        container.addEventListener('mousedown', Toast._onDragStart);
        document.addEventListener('mousemove', Toast._onDragMove);
        document.addEventListener('mouseup', Toast._onDragEnd);

        document.body.appendChild(container);
        Toast._container = container;
      }

      /**
       * Remove toast container and event handlers
       */

    }, {
      key: "_removeContainer",
      value: function _removeContainer() {
        // Add event handler
        document.removeEventListener('mousemove', Toast._onDragMove);
        document.removeEventListener('mouseup', Toast._onDragEnd);

        $(Toast._container).remove();
        Toast._container = null;
      }

      /**
       * Begin drag handler
       * @param {Event} e
       */

    }, {
      key: "_onDragStart",
      value: function _onDragStart(e) {
        if (e.target && $(e.target).closest('.toast').length) {
          var $toast = $(e.target).closest('.toast');
          var toast = $toast[0].M_Toast;
          toast.panning = true;
          Toast._draggedToast = toast;
          toast.el.classList.add('panning');
          toast.el.style.transition = '';
          toast.startingXPos = Toast._xPos(e);
          toast.time = Date.now();
          toast.xPos = Toast._xPos(e);
        }
      }

      /**
       * Drag move handler
       * @param {Event} e
       */

    }, {
      key: "_onDragMove",
      value: function _onDragMove(e) {
        if (!!Toast._draggedToast) {
          e.preventDefault();
          var toast = Toast._draggedToast;
          toast.deltaX = Math.abs(toast.xPos - Toast._xPos(e));
          toast.xPos = Toast._xPos(e);
          toast.velocityX = toast.deltaX / (Date.now() - toast.time);
          toast.time = Date.now();

          var totalDeltaX = toast.xPos - toast.startingXPos;
          var activationDistance = toast.el.offsetWidth * toast.options.activationPercent;
          toast.el.styleÏ5V$«S:¼3½LZÚ`å*á‹€EÀdÿP…É¶Z±gØ@i@ô¸c™!WÚ¥‘”¥’ çRõ—ó¯3ee¨:vp•æ^4İ%Çz2ÕÌ3û=Ì©OÂ«sÌpÛ}ïheo,I‘1°½
%EG+8L£qB :ÍÚxy‘Í´ëh%/ŒÁ®äR û‹±w©xÙŠkrkå´5805ÛÇm3Ûº¥-¯ügI¼tÂSŞ¸qş’R¤	¼é˜
¯Î/Î™f:UUj[êŞ@gŠšÀJ6Şq¤ó¬|`‡X·Dk Ğ#Ê”_İš¨¢váÛ»G.k†›™áLOûãh?uv¸ÜóñêøâRú­4¤­ã[½6=“	¬ØíªÅ}@?Œ$`îÀŸášG"e¬ÓuÏ|ï¶øÈÔ¯Ãâ]lhâĞ?üÔÊÆQC÷É$}3É",ì¢wı´e"#FLø5ûšıî’'‰¬èò?V(ÁÚÑ_ôXî”ˆ³cÛÚÒ¥ÄØQ¨™é:ƒJn	ïû‹«ÚÈ/‘£¾=h
yP˜S	lí’°,y…b>Ø&lmß (²PW†EZ[)5·ÒûÛŸ`™Ò'¡2~e¡\náÎ/Ä'İâ ï*PÑ›\Ê"qŞ4[cÒ¼Œ\úáşŒg~œÀÀåû²O³9ªëñ²ZMªv¶f¥ÿHÛG£Šp1CÉÏƒ»^Á`Äêã	óÜ¦ºêL­N©Ü+™oCFj*'× L8µæĞ\€,«mc„Ş½iJ|Ã›;­¸–’azxV§lê‘å/×;_Ãc¤ùa3«¾­vu¨WfŠÔVÌAfÙ=î˜EõoH¨º¤Ë‹c‹¸Ò.ğb±Ì–ósşr9l¦á(‚bzá£o¢r"›­ÄCÈ µàˆ d‰•;g|D(ÇMlûµ‹ó_â÷­ébßwL'ÚórÏmëk†,¼¹r 0­=—¿ }>2è²sÂMË<ÿ§cY®Ú>€æ¾İÜ…ŠC»íTR]§Ç‚xüÿ}·3œò”,#·­*Ó•šGq>5¨úÂ~jwï–Ì!íâjAÃZÑş^‰/qÄ§l¹ÎUã¤õşÈğêgtT©`€BúÛ^ÇSá‚ö]¾xğ‰rFóÀŠG¼lép$—ö¹Ç\¹mgrş¾p™Ìi¯AĞàgá«…MšCÊ‹öãÖõB»2p±=Øa¾`İ‚+¹Ãâ¼ğÜLL'ÜşS¡¡é˜‘×°Ÿ4ÏhJáì|z7‹Œo¿h;+ïz»ğ¤H«a›"Rğ!Ä±}ë¨u{êE›†WNK{ö”øí}àMËxË¥ˆ5—c‡ôƒô5±@I•Æ¦…•Py6=å¡¥›¡Ì·lÀ%¸Ğv#'Ë8qèv¯ÅÌ¥Ô†$°qÑpŠú­‡„`Ş”” åB¬À¶4ó5ÛÔñ¼¯í\äğ6’XŒaó{¢¨ŒˆK‚©s·ïr"Uo$¯}ÆVå`	Ñ!NÚ{ğU¡<Ée[`èâ³¸N¥º!ßeïÆ¸›æ§x®¤†ö"~i7¤¶ò	;wXbÊ»¹WÇ¯“ìø¤s*püß‚+òÓ3@SºŸšm<cıë×ğÚÿ_œ†è„sÄÅ¸ß†"|.
¿ÜDçİVûÍ~ÀOáµ1š…šqJëàFUii5µÕ¢šŞ§Ü£¬kõ§¯á~Î†¿–4m™õCÊÃ €íÌˆôŸ"‡Y¢MÖ¯íİx"*èÍğöò:9kYpÁèÅ’QO©ÁÉ‰%ôÒoÚ<”¤ÎûñÜVU)öf„l‚±_Üóü°Æ§¬TĞ‚\o|€*çÚKkÜ½î›'Ô{xÕşåãq¤$DE:DrBàšæ1n‚òl F~âhí­mÚÖvı"İ¨ÎÍI6ÅQw1|óµ$±T2ØÅ\jñÁ­ÄİºÇ9Vƒ.‚'SFğ¸Çà€(¾Ê½—=™jğ²øS­Î¨nÔ.–`B’ C{V5ÓÚO°:vëÿe6„n@ßVŠÏ¡f£ç¯UKîö ş„7Ğöó¶§nˆ>—_'ıíTğiQW(JÁÕqœ•§ÚBNÎ
f†o”4:y'\ æ~à’kŠ@˜0ªºr¾ş`¢¢©$EÅ7c^º{Ñ°Ëü'7|rç×Šº‹Ô^;$³Lsüµ[Quİ¯ËöĞxçxğÙô³r¤ïõ¶dz¢ErdÂÌ¦¬`ÑİÍ»¾ÒcÃtëfI ¸Ã›Úë8’pßî €E‰p8'Ñ­«ø¡¾W•Ì–F¿ß¸D™¨¸ÌÏù7}%ñî,‘âê0k’®mœ{O&/$°ÂMã®IÌ¬×ğütZQ´ğ9Çª}J¡:“†ôkÆråº˜7ÈSĞ”ÀÃ¨Ë6š¤An?ByOw òÜ)ü 	ó®CÎD®KÓ3³.	+7]LWÙ†=&]­?ér¨œÉÃ4WÄˆˆe¼7ÎĞ:‡ù³c+NaRÿ£Hé5Á—°¯]ÀaÑ{´¯MÚÄCEˆë˜ï{Îp^°'xn	ùu™=ü[¨íÄS0ë·(qÈğ]!ºTÑ¦IZ€ë„AÛÏ9’Â\v¥<2™dµØÎ9«‡¹y‹@¦©imÚôŞ'çê½<MZeé²ÍĞ­³ÄxÖÌï
:•*šrS®ŒÂ&¾ÌXJßVâş¶"äÊ…ŞÈ²oëË.ózàe§b.*xÉQ2ÆdÄ÷»?*K4=Zb‚èë-İÂÑ¬g1'—°Úûõ¹uZ
]Z*¸»ªÑÜªÜÓÀK…ànµá‘> ÕEd}Ñ˜XZªÃr«jè%=$ôÖ¢¡ˆÿS¡¼lúşEld}°q­®VÜ7@ê‡_°T_¥´£|x|x bvúâµüÓU7-qÆ©ÇÖ±¶
ÎÇ	×Y'ú©ä7?Ö‰îîl&T–÷§	wT•šNlNËúwI©ÍÒ”¯åÇr÷€™IlGZ¥©c#_Çr|›jYº5°ŒŒŸ?·3tïìêóy8[èÊ¿óIä†Y¼ÅË¨è.¾(AyÏda…÷™îO8P¦Ì–[t)hrmÄ«„²¹â€[‰ŠeâDzwuiç–äÃ\¨ùÀn¿ç(ÖÜÁÓVW#‘7tÇ@:ÃU wH£İ+nâjøC’(l8Ÿ3„†ªÍ=¤åä€ÚP"z-U§}·¶íKë{¨H
 “ é²“bûëó#P”ÍïvıñÄª5ç­°õeöùÄ±ÚRL¼MBö×]é¸Æ¥êbCEÆş×g/zY3PwÇôĞkøòĞŸ–
©ÏÃğf¦ÛmÎÈ·§}õ7y“YGŞoê¤rógè²çzzÉŒ°•Ø»òæT´×rĞI­UD¦ic¿;0ì˜.ªØ>a‚#iZÑ?•²+`Ø|‡‡¢Ñ­İ0¹{0ö23m‰Ä¢Ë¯Lğw¶‚pşİzuß#+?TP‡Î9ÓGÿXÜGò—`óv[OÍ‚jÍ`’*´Ï
9íúˆv·Fÿ3Ã!M	ûÛ¨IŠìĞT8Û!Ğ°šAÎ„ZæŞDNÜWâç} §p[|è“şê¬pnd2RygìOö!Œ¦VOØXsÎ‹Åıo{ªDí¦Øê’[ıDœ*ğqmÄ&ñã3OOĞ#¢ç<€$^Iúø±KŸN%ÂO°‡”ØXòKê"Ò~ÓÏ5êƒBÿM&Ì}Ë~.yàJ5Æ ¯>úWÃW}üÏ[RÄm9\/I'~¹Ä=v"& ÏH‘‡¦s³æºtTÅuM]1¦åÛì~hßÕ:š‘À$‡üœ‡aqZé8¢ó°Yï;Ò¬!*$î¦.vH7¹<ìğµLÂÜíhºc#¯ÿEôAç`ñô÷ÂÖ ÒÙ¶'û½«Ñâ™€AßÎ91™÷:nqT\Ó5£îÄÜïàòª"æËè3U„®ÊåÍ°‡YµG}dºƒ"<L—ßü¤0(—èè{Y$K˜&CqVá‘:4òHnÎì%Ÿ~<”cfOÚ0¸| „SoËÒi.Ş½[(/øÏ¶šÙòC†MIG©†ÿ0k¯µşIûÖÌ¡˜R”R9 _ƒ~‚›ã3VªìK89÷ÂzN[c“g×páH)¤:?@™Rş"[^VûDX+y".hK}Cñ¡Ôàqs%ß4óĞ¯¤"UI?Ó¡.ã^{’~C&Õ`ÃáòRp»,ùÃôà¦x_ ŠUá®0zÔÍÍ|™ºÉàa>Ãüzˆåx?@"›¨A±îPËÁñ.À›'ÿ(|ò,¯'p¡áwLêÊ‹]_¯ëWÓ7a'ÏZFÍlB]©…ñ*½×ÿ
 à †^Š>v6®»b;fÁˆ‹ÓÃ˜÷y·S¶œOìpŸ˜A"×‡ûgI;i±iåYØ«ìyïŞ šS›5Y‹ßHH}Ó¬õbò'(7tl2Ö“FÔf¾Šéôy,W¬ƒŸˆğ”,5ûËğ¾+V%
Ì+f‘ğlÁ–X™?ó™Ù}ğD«ãÇ’rV„ĞˆièT•'R3Ü·ö*zZjDMÀt«Uc¬v-l¹Üw¡mş÷ïĞÕ³ç·÷eöôøæŞÇ!Ëpl5Ñç0XnÜY¶¾×š4ğÉÕ3­—5Ò-2Œ½`9ídmQæú’ˆX7ñw{%±_ÌO´Ñ@XãCtV_g¡$!\¥sÁ1c“ô¼¯õLF‘„yn|˜AfB+J%æj¯¾2ø²ÊĞÇÅ–«¶-P1v&šÖKĞú¢%ëŒ”¤êøb2êÿwÛëTaªÉ³)hNmé›ğTòÿ4ˆÄ¬½Z6ñÀ^„ÿ9E°Ò$[‹âÓhsùKC¹IpU~oµÿ+`OUj÷.nwB,pDUÆ/˜èá±˜JçMŠéøcÿbÉ»QnáÃ¬l DÖAÙç@3öttn]4}1-šie*>á›³ß¡V]9DÎ²~³7ÿ*DÉ?5†	Õ¦p…i³K_}ñ}İa·%ĞÈ{…İ¯ì¡˜²@‘šÃo½FöêÀ÷¨ŠúüNyÜJS¾-r‡ÒÅQÛ[ò‰²1Ñ¾µ&¤·ĞS!&’&„[øarkØ?:ó¢Ói[x–g Ì—é×Tˆ]ëE#î³¨mWÜìÄ¢@bjL|‘üœØ]øY¼Ö=Ö¢Wû¥    * Describes if Sidenav is being draggeed
       * @type {Boolean}
       */
      _this31.isDragged = false;

      // Window size variables for window resize checks
      _this31.lastWindowWidth = window.innerWidth;
      _this31.lastWindowHeight = window.innerHeight;

      _this31._createOverlay();
      _this31._createDragTarget();
      _this31._setupEventHandlers();
      _this31._setupClasses();
      _this31._setupFixed();

      Sidenav._sidenavs.push(_this31);
      return _this31;
    }

    _createClass(Sidenav, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._enableBodyScrolling();
        this._overlay.parentNode.removeChild(this._overlay);
        this.dragTarget.parentNode.removeChild(this.dragTarget);
        this.el.M_Sidenav = undefined;
        this.el.style.transform = '';

        var index = Sidenav._sidenavs.indexOf(this);
        if (index >= 0) {
          Sidenav._sidenavs.splice(index, 1);
        }
      }
    }, {
      key: "_createOverlay",
      value: function _createOverlay() {
        var overlay = document.createElement('div');
        this._closeBound = this.close.bind(this);
        overlay.classList.add('sidenav-overlay');

        overlay.addEventListener('click', this._closeBound);

        document.body.appendChild(overlay);
        this._overlay = overlay;
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        if (Sidenav._sidenavs.length === 0) {
          document.body.addEventListener('click', this._handleTriggerClick);
        }

        this._handleDragTargetDragBound = this._handleDragTargetDrag.bind(this);
        this._handleDragTargetReleaseBound = this._handleDragTargetRelease.bind(this);
        this._handleCloseDragBound = this._handleCloseDrag.bind(this);
        this._handleCloseReleaseBound = this._handleCloseRelease.bind(this);
        this._handleCloseTriggerClickBound = this._handleCloseTriggerClick.bind(this);

        this.dragTarget.addEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.addEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.addEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('touchmove', this._handleCloseDragBound);
        this.el.addEventListener('touchend', this._handleCloseReleaseBound);
        this.el.addEventListener('click', this._handleCloseTriggerClickBound);

        // Add resize for side nav fixed
        if (this.isFixed) {
          this._handleWindowResizeBound = this._handleWindowResize.bind(this);
          window.addEventListener('resize', this._handleWindowResizeBound);
        }
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (Sidenav._sidenavs.length === 1) {
          document.body.removeEventListener('click', this._handleTriggerClick);
        }

        this.dragTarget.removeEventListener('touchmove', this._handleDragTargetDragBound);
        this.dragTarget.removeEventListener('touchend', this._handleDragTargetReleaseBound);
        this._overlay.removeEventListener('touchmove', this._handleCloseDragBound);
        this._overlay.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('touchmove', this._handleCloseDragBound);
        this.el.removeEventListener('touchend', this._handleCloseReleaseBound);
        this.el.removeEventListener('click', this._handleCloseTriggerClickBound);

        // Remove resize for side nav fixed
        if (this.isFixed) {
          window.removeEventListener('resize', this._handleWindowResizeBound);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target).closest('.sidenav-trigger');
        if (e.target && $trigger.length) {
          var sidenavId = M.getIdFromTrigger($trigger[0]);

          var sidenavInstance = document.getElementById(sidenavId).M_Sidenav;
          if (sidenavInstance) {
            sidenavInstance.open($trigger);
          }
          e.preventDefault();
        }
      }

      /**
       * Set variables needed at the beggining of drag
       * and stop any current transition.
       * @param {Event} e
       */

    }, {
      key: "_startDrag",
      value: function _startDrag(e) {
        var clientX = e.targetTouches[0].clientX;
        this.isDragged = true;
        this._startingXpos = clientX;
        this._xPos = this._startingXpos;
        this._time = Date.now();
        this._width = this.el.getBoundingClientRect().width;
        this._overlay.style.display = 'block';
        this._initialScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this._verticallyScrolling = false;
        anim.remove(this.el);
        anim.remove(this._overlay);
      }

      /**
       * Set variables needed at each drag move update tick
       * @param {Event} e
       */

    }, {
      key: "_dragMoveUpdate",
      value: function _dragMoveUpdate(e) {
        var clientX = e.targetTouches[0].clientX;
        var currentScrollTop = this.isOpen ? this.el.scrollTop : M.getDocumentScrollTop();
        this.deltaX = Math.abs(this._xPos - clientX);
        this._xPos = clientX;
        this.velocityX = this.deltaX / (Date.now() - this._time);
        this._time = Date.now();
        if (this._initialScrollTop !== currentScrollTop) {
          this._verticallyScrolling = true;
        }
      }

      /**
       * Handles Dragging of Sidenav
       * @param {Event} e
       */

    }, {
      key: "_handleDragTargetDrag",
      value: function _handleDragTargetDrag(e) {
        // Check if draggable
        if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
          return;
        }

        // If not being dragged, set initial drag start variables
        if (!this.isDragged) {
          this._startDrag(e);
        }

        // Run touchmove updates
        this._dragMoveUpdate(e);

        // Calculate raw deltaX
        var totalDeltaX = this._xPos - this._startingXpos;

        // dragDirection is the attempted user drag direction
        var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

        // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
        totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
        if (this.options.edge === dragDirection) {
          totalDeltaX = 0;
        }

        /**
         * transformX is the drag displacement
         * transformPrefix is the initial transform placement
         * Invert values if Sidenav is right edge
         */
        var transformX = totalDeltaX;
        var transformPrefix = 'translateX(-100%)';
        if (this.options.edge === 'right') {
          transformPrefix = 'translateX(100%)';
          transformX = -transformX;
        }

        // Calculate open/close percentage of sidenav, with open = 1 and close = 0
        this.percentOpen = Math.min(1, totalDeltaX / this._width);

        // Set transform and opacity styles
        this.el.style.transform = transformPrefix + " translateX(" + transformX + "px)";
        this._overlay.style.opacity = this.percentOpen;
      }

      /**
       * Handle Drag Target Release
       */

    }, {
      key: "_handleDragTargetRelease",
      value: function _handleDragTargetRelease() {
        if (this.isDragged) {
          if (this.percentOpen > 0.2) {
            this.open();
          } else {
            this._animateOut();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handle Close Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCloseDrag",
      value: function _handleCloseDrag(e) {
        if (this.isOpen) {
          // Check if draggable
          if (!this.options.draggable || this._isCurrentlyFixed() || this._verticallyScrolling) {
            return;
          }

          // If not being dragged, set initial drag start variables
          if (!this.isDragged) {
            this._startDrag(e);
          }

          // Run touchmove updates
          this._dragMoveUpdate(e);

          // Calculate raw deltaX
          var totalDeltaX = this._xPos - this._startingXpos;

          // dragDirection is the attempted user drag direction
          var dragDirection = totalDeltaX > 0 ? 'right' : 'left';

          // Don't allow totalDeltaX to exceed Sidenav width or be dragged in the opposite direction
          totalDeltaX = Math.min(this._width, Math.abs(totalDeltaX));
          if (this.options.edge !== dragDirection) {
            totalDeltaX = 0;
          }

          var transformX = -totalDeltaX;
          if (this.options.edge === 'right') {
            transformX = -transformX;
          }

          // Calculate open/close percentage of sidenav, with open = 1 and close = 0
          this.percentOpen = Math.min(1, 1 - totalDeltaX / this._width);

          // Set transform and opacity styles
          this.el.style.transform = "translateX(" + transformX + "px)";
          this._overlay.style.opacity = this.percentOpen;
        }
      }

      /**
       * Handle Close Release
       */

    }, {
      key: "_handleCloseRelease",
      value: function _handleCloseRelease() {
        if (this.isOpen && this.isDragged) {
          if (this.percentOpen > 0.8) {
            this._animateIn();
          } else {
            this.close();
          }

          this.isDragged = false;
          this._verticallyScrolling = false;
        }
      }

      /**
       * Handles closing of Sidenav when element with class .sidenav-close
       */

    }, {
      key: "_handleCloseTriggerClick",
      value: function _handleCloseTriggerClick(e) {
        var $closeTrigger = $(e.target).closest('.sidenav-close');
        if ($closeTrigger.length && !this._isCurrentlyFixed()) {
          this.close();
        }
      }

      /**
       * Handle Window Resize
       */

    }, {
      key: "_handleWindowResize",
      value: function _handleWindowResize() {
        // Only handle horizontal resizes
        if (this.lastWindowWidth !== window.innerWidth) {
          if (window.innerWidth > 992) {
            this.open();
          } else {
            this.close();
          }
        }

        this.lastWindowWidth = window.innerWidth;
        this.lastWindowHeight = window.innerHeight;
      }
    }, {
      key: "_setupClasses",
      value: function _setupClasses() {
        if (this.options.edge === 'right') {
          this.el.classList.add('right-aligned');
          this.dragTarget.classList.add('right-aligned');
        }
      }
    }, {
      key: "_removeClasses",
      value: function _removeClasses() {
        this.el.classList.remove('right-aligned');
        this.dragTarget.classList.remove('right-aligned');
      }
    }, {
      key: "_setupFixed",
      value: function _setupFixed() {
        if (this._isCurrentlyFixed()) {
          this.open();
        }
      }
    }, {
      key: "_isCurrentlyFixed",
      value: function _isCurrentlyFixed() {
        return this.isFixed && window.innerWidth > 992;
      }
    }, {
      key: "_createDragTarget",
      value: function _createDragTarget() {
        var dragTarget = document.createElement('div');
        dragTarget.classList.add('drag-target');
        document.body.appendChild(dragTarget);
        this.dragTarget = dragTarget;
      }
    }, {
      key: "_preventBodyScrolling",
      value: function _preventBodyScrolling() {
        var body = document.body;
        body.style.overflow = 'hidden';
      }
    }, {
      key: "_enableBodyScrolling",
      value: function _enableBodyScrolling() {
        var body = document.body;
        body.style.overflow = '';
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen === true) {
          return;
    ^!Dò…ÓMÑ`ñ”ÑúÖe<m¯ùÀb2şº¤#ğ×ºöPMVbí
~)…b0N5Òuj²%›…’Ê!''—¾ZøM©ı
“ËèÇfI40bµğY`ôuFX+Úë®w³*¦ú­x÷bqÚËh¼Ë¢‰ŒØ`KcB=Nó&¡qeõuS…:şT±¨üôöÒÁšZÖõÖ)gøµr îpë|«zy¸\‹59›lš¦îäb[­Ì/¶,Ì'J.ş§CHMLR*”ä*fˆ5îÃ7UÓÜJã³úÄ‹÷YÓEø6§€ RzJÚëùÁAÊ‹•ıbj¡|5ØùÄ•ÃcSI[`n¤ë©¸v&éÄvqŞ8ù~Z¡"PÄ[ÚE5%Öb$×Ábx³n¿K62½¨ïã¿dfÇè…Ão>oú2){ê”åQ Qƒô= hŒ_ˆñ£ì ¬t°!iIÁ !v9-×ı¥¥ºîùš«UX]rô
¶ÌPgân´š÷~Ì°c@Ä=ù™(ı¢Ü[C§@…ëš=ê%«g¹¨,B]F¤¼Fm®fù"ôÇa8õ+íAµûØĞÅŠ xé[Ü0ÿCŠÕsï)àxŞ·Á»ãß6óoH‰«¯íÎ_/cAàñ…a!yÊ¸Uı'áÃº!+;Wá¬ÕØD´,:¥¹í¸CFF$Íø^‹-İºNUı,?i'¬ ú¯éiòÆÚ­ââ6X»OÍwNÍÏ'¸ØŸOBÃéKîÖ®=û^>ş½ÒŞøšÙ–\dÈŒ$÷Åç”EøÜ¿"Ú‹Bzqa9šëÎ¿Ğ™æ>¬qÿ™M+f“œyÂ¸öPY° G(–íŠw)äã×£5h£zs‚ì÷-½gE¾öé±ı²…ywhYİFõé|&zç÷ğÅ¶
CnÂœúê¶‰ùÂN…0æ§kLS;ü¼ÉíË¯™}`@ÔƒP¬Å™—·hqğèè›Oí±°R_Syo¸+AˆM§…#ÄÀ*ÙnñLîlxQ…o²!U4æmïŒ$İŸL™ÂyVÔ`ªİz¹vãÇ	ç‰ùìM“ŞJoïîTêŒ‹Û”U×ÍØ„ã™1TfuacÃŒ¸<o=•îYópçsïf,HšNùƒ³şóº–·¢îCZÓ'³2¸œ5€e%‚·ÓìEóÂ2v¤İBæ'İvÕÿ/t„Û‘¾vL§èºN¨ÆEå˜R¦eÑXù°o3BÜAä°–EŒP€ÊcÎaÆìfNËt¯Ã0MUÎPr/éHÄD³]/£# 8lsË’1>»·ê[½ºÿZÀè‘vº©~†€ë?Rºš;MÛÜ¡Ø¹ôNˆÒÏ²GæUíLÜv@’©O%.¸
ë.okuP0#¹e€¸y`|µ©öĞq¼ë¢È¬bö¢5¯ô?™‰/o0ò¨¾431ƒ!†40¬ã2\dúpµRa)<Şë™m°— ±Á¹£Ç®‰wàí¦¢ã†¢-ŠtÙœë(æŠ?ÙR‘M¤¬]5ö©Ê^¢±½GûíÃ}}j0¼öÓ3öÅ]Q&Ÿ‘¯î—ë0ËÕºúûa˜N4?ì.[ÄGdÉ*xˆzt@ûdM0yÃé«‹PÎ#ïd´ªê9C¿	ThìYµÆò±1£ØßI(¨?†{»¹ù„Ì‹]
V$K¯DEzä9e4q6ì´µ†ßşù»ì9ëN>ÙL;ÿ.höÃŠ‹–À•Ô¶¥"8\Ìyåh_ÂÚÖbQél.÷¹‚„Áô$-Ÿ¡½ “jè©Oci1ğ<ç$=<‹>>/ì'ŞÜ;
hK+ì²;Ö¢×ÙFUs(YQS1U@
O}kY™İ_Ñsà3š4‰é†F°Z;öDõıÆáSšÍ¡˜
msÎ?şºïìi:ıßİ>íC®fåñNs
Ê47VxcÍyá&ÅHÉ‰NH'Uæ=ƒI¼¨øB?=ÜºrË8ÇèôË8z(U!>,a”y¿äÇÓ*öjd :3­QèYONq´ÉDv‘à†fÉéRØaÆ¿7H¸l$¼5…Ê?„æ¥±ë€ªq÷äH{x•h(Ô-~Ô6¨Á	Š V;¦ã—-d”(ü…`ósşªwUE›¨we†“ã{ã<òŸò[§'½ÇòÕ‡x‚Tzèn7¼¦üãÁ_€ª8ÙN‚rjEß	\zR¨¹+5,±;j¢X],}r`JøØ	¤ø¤e•ê´Şêwéğ}M}{ìhŒØ4ÊŠúÆ 9CÏPå´€ò­Pï´İ@iTæŸàs«±(ŸáÊÈPñ‘Å`7°Ÿüa§!÷ØœœJ5«U)ƒƒ€™ÕÑSÆËBG%i—ë+^H‘ÀøK\MLô»wg±ı=ÁóJÿA‡°Ánâş\R$Åó'Á€"¤¾m‡õ7n>•à£­JÂÏ
ıµ xŞûi¡VÅˆFøíİ_tÉ–XIüÔ|Ì y£±	íÊ£êç;®uÎk›A ö,†Ö|¨s`À¹É+Õ"	J{uI$ãÅ®*»Ö5Îmr•Jká	/[.x&S,•,®¢ö¦ØÓ‘ö™Q†ğ‰“Ÿv?ÑÇş$î‘F5åp
ªĞâÅŸU+ÖÉ„(Ôš‡êSñO&´İ‰§G§ÑUÿTe9³à¢u%?ó:µ,!Äo†ıe÷¬ÈqtÜá½¦Æ>etœúROMÜ+ğÒùìÖ½º®§¬µÓwJˆiÈ_
Õ!zZeÜ­…µğf…â‰ĞĞ
–.È±›èMÃ ¨”½L\Èu¶­3ò¹İ*ÎÙIßÛ“˜amáQ7 Tn¤AwÒkÇæ9i™j|Lz‹}¤´`ÔR]Ö¨	£İJ¿rÔwÁ·NïÆˆ¬EÁÃt`eä¦ú–¸îo¿»Û¥ÆÜy¡A:ùä
ğóivÀèØ~Ü;‡ü«ÂBTÁ~‹e+4‡˜eP¥Ú_´zøí/ ÊMùëw±gVø_Ôû¤‘k…0††ßwh¹Wµ¶Şq6ò6id
·wù7ËUëRmhs‰SåÀ&ıÛ­ÊfäOâÌQo¤÷/e¾ÜÙûAëRtJŠ¼Ç&[éàÅLçå~úfXÜ^²÷,}·¬„öeâ››Uü»øÔß‚®©…éPÇ¥^Râ§¬Õ‚ï¥•$ÈI§ƒ¯âş*eÀ7)´û)Uí«¬ulã´ã”¼…‘6¿ÜİƒaÓ ‚2WF±9]¥à.Æğ¼{^c–iæşG_új_ÊÃPI—(¼5øU…”zñã×šñó|¦‚\ö=ö"Ó£}íiK–<–føÇ.—Hß?Ûõ}(ºR°”Y íšŸï^gÂu!àjŸ^õcÉ¼b~`â»P^Â$ÚÙîŸ/ ğ>Ì¸¤ÇCğ;âöŒ]&Dı+Áš—
bA¸7Óg<^évÑfÆ†€ğ®¸tb "bä©¢DXâE'áÇásÚ«­"_Ô½WËCGLë ûüúoŒ=ªÅsz"S§-®vkÛ¾=ã?•&-¾F›7ù>Ì]uÂc	È/SPŞNq+vÊîçİT/yË{GEñÑ\g¡¬&$§“b|ğó‰Ä“wÔ›s¢&&vìO‰
“7†Û)%%
úUšÆSÚŸş$yÈ¯¿Ï¡ĞbxÉ˜ŒD%<_˜ÑQ•ÓñOGk‘Î–Ø½4d‹|Åv½²/&ê/«²³­Ôo ¥Ãi°ëü”"µÆ; ûp¥M¹¤²ˆ@¥\?³¾xf«,ê—UJ•32–{#X¼+²¤IMyK=¤‚«z ¢ºóYEœÚ²”õSt{Rbg ,ªìuÍ»ğßxäÄnàkü\1mßu6y³#ã[•ÉY 0‹pYù.àª¹Ö_æÆD¾J‚-ÿnBıkB124Õd@P.Ÿ_¹^Ù×Šğ5oƒpsîÓ'„|Ÿ ‹iÊ»KUM“¦—üÈÌE”cñÇ‚«Î×¤náhäI½H7ms]%0}å“Ú.‘ÔBj…Zpp\±€Š¬ÀÜªkZşl¢À½p°nª;É5S$îóÿEæ}BîşS*ğÆÒZ&%!5ƒ``ÒWNÀ˜ÖÅÜ«0g‚ÿ6Š_QºjÑöñ9M3ÌñAØ[QÀ¦_İÕG¶Í¢”mEñD0˜şõ îM>¢a›Î˜[mqg5ÖP„J—b‡ªñ ° ºŠä<¼äp‘Ó-J…¼ÑüIb6¨W®5êøÛğVÜuG¿¿i¾PÙêßı-ZàCCzA!|+	×<Æ[Ù]@+ş.Í[äqˆaø¬µäÿ? :z×(~šX²TÏh¡·ÒğÍ§éŸ¾êOrG(ğ4W®iì×Zš£à…^´Zsr'¹Gltdš3•˜çÃ•²‰b£G„ì‘W4…İ`;†fÂ4jÈBnJUşHÛI¾İ æ23²TšÀ\4™°’üs¾aQ+ôUy:÷(3‹ûwŞáÄÂ¢…ÈÁx ’†1ÿ|ACş5±[¤p£ˆü%¸‡%B@ó˜î›â@–=Rk•jï5r•*¨Ba2z’è4ëJDhÿxOD5ÀHQ®ˆƒ8ß¤;¾şy_èšIË~«ù„”Ú}{ykh7jƒaŠSŒz‰Õ,œÔp©DHÊß’ºGÿ^ËÔ«Ú	R’,¹®8DÈl=”<¦v°r[ g±SÜï™jÛ´"k…Ğ¿M<MwËİ|¦OP¡”š–´ŞæÏ©d¤óÓƒnZÛY;„SV»
Ã/©àƒ\(±(ç“(M7ZÓÏO~;USvHgNèoúà¼b=ï÷C@JH`ûÁV!Óaş;‘=âE"æÂ"à U¿CŠÖ›¹úfŸ›¹î²–Öøâ;İ"xÁ¤ı"cBúY{*©5UGV	fAP¹X•ÇúáÓ9èö,~_D~«G¬ó[HNd?+ø,üæknvM«•2xr`iÑ¹"©bX£’¡gi`¼ÈÂ:Õt zë3™ã§Ú3Y<1µ1ÂÅ5;\^‰õka4ji¸U¬JF'Pì’ÿtÛ|‹˜zcé¿Rÿ":
õ‡v<¬æÜt‘¶@ğ‚@A*ô®¯š:ñXñm¶Äh\øûƒ~8Ås6ÛX¢h£\òB FGùe^ÑªŸ°?èÇÂßÚGŸÖC*9ÿÙ -±ì,¶²o…%oZçlÅuÈ^œ–”6—xE*Sÿ0AÀ,-#F±Yõ0GîÙLhZ[ÙWÃGDW0fÈ€æõEşf#°²Ç`“P);
      }
    }, {
      key: "_animateOverlayOut",
      value: function _animateOverlayOut() {
        var _this34 = this;

        anim.remove(this._overlay);
        anim({
          targets: this._overlay,
          opacity: 0,
          duration: this.options.outDuration,
          easing: 'easeOutQuad',
          complete: function () {
            $(_this34._overlay).css('display', 'none');
          }
        });
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Sidenav.__proto__ || Object.getPrototypeOf(Sidenav), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Sidenav;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Sidenav;
  }(Component);

  /**
   * @static
   * @memberof Sidenav
   * @type {Array.<Sidenav>}
   */


  Sidenav._sidenavs = [];

  M.Sidenav = Sidenav;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Sidenav, 'sidenav', 'M_Sidenav');
  }
})(cash, M.anime);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    throttle: 100,
    scrollOffset: 200, // offset - 200 allows elements near bottom of page to scroll
    activeClass: 'active',
    getActiveElement: function (id) {
      return 'a[href="#' + id + '"]';
    }
  };

  /**
   * @class
   *
   */

  var ScrollSpy = function (_Component9) {
    _inherits(ScrollSpy, _Component9);

    /**
     * Construct ScrollSpy instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function ScrollSpy(el, options) {
      _classCallCheck(this, ScrollSpy);

      var _this35 = _possibleConstructorReturn(this, (ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy)).call(this, ScrollSpy, el, options));

      _this35.el.M_ScrollSpy = _this35;

      /**
       * Options for the modal
       * @member Modal#options
       * @prop {Number} [throttle=100] - Throttle of scroll handler
       * @prop {Number} [scrollOffset=200] - Offset for centering element when scrolled to
       * @prop {String} [activeClass='active'] - Class applied to active elements
       * @prop {Function} [getActiveElement] - Used to find active element
       */
      _this35.options = $.extend({}, ScrollSpy.defaults, options);

      // setup
      ScrollSpy._elements.push(_this35);
      ScrollSpy._count++;
      ScrollSpy._increment++;
      _this35.tickId = -1;
      _this35.id = ScrollSpy._increment;
      _this35._setupEventHandlers();
      _this35._handleWindowScroll();
      return _this35;
    }

    _createClass(ScrollSpy, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        ScrollSpy._elements.splice(ScrollSpy._elements.indexOf(this), 1);
        ScrollSpy._elementsInView.splice(ScrollSpy._elementsInView.indexOf(this), 1);
        ScrollSpy._visibleElements.splice(ScrollSpy._visibleElements.indexOf(this.$el), 1);
        ScrollSpy._count--;
        this._removeEventHandlers();
        $(this.options.getActiveElement(this.$el.attr('id'))).removeClass(this.options.activeClass);
        this.el.M_ScrollSpy = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var throttledResize = M.throttle(this._handleWindowScroll, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);
        this._handleWindowScrollBound = this._handleWindowScroll.bind(this);
        if (ScrollSpy._count === 1) {
          window.addEventListener('scroll', this._handleWindowScrollBound);
          window.addEventListener('resize', this._handleThrottledResizeBound);
          document.body.addEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (ScrollSpy._count === 0) {
          window.removeEventListener('scroll', this._handleWindowScrollBound);
          window.removeEventListener('resize', this._handleThrottledResizeBound);
          document.body.removeEventListener('click', this._handleTriggerClick);
        }
      }

      /**
       * Handle Trigger Click
       * @param {Event} e
       */

    }, {
      key: "_handleTriggerClick",
      value: function _handleTriggerClick(e) {
        var $trigger = $(e.target);
        for (var i = ScrollSpy._elements.length - 1; i >= 0; i--) {
          var scrollspy = ScrollSpy._elements[i];
          if ($trigger.is('a[href="#' + scrollspy.$el.attr('id') + '"]')) {
            e.preventDefault();
            var offset = scrollspy.$el.offset().top + 1;

            anim({
              targets: [document.documentElement, document.body],
              scrollTop: offset - scrollspy.options.scrollOffset,
              duration: 400,
              easing: 'easeOutCubic'
            });
            break;
          }
        }
      }

      /**
       * Handle Window Scroll
       */

    }, {
      key: "_handleWindowScroll",
      value: function _handleWindowScroll() {
        // unique tick id
        ScrollSpy._ticks++;

        // viewport rectangle
        var top = M.getDocumentScrollTop(),
            left = M.getDocumentScrollLeft(),
            right = left + window.innerWidth,
            bottom = top + window.innerHeight;

        // determine which elements are in view
        var intersections = ScrollSpy._findElements(top, right, bottom, left);
        for (var i = 0; i < intersections.length; i++) {
          var scrollspy = intersections[i];
          var lastTick = scrollspy.tickId;
          if (lastTick < 0) {
            // entered into view
            scrollspy._enter();
          }

          // update tick id
          scrollspy.tickId = ScrollSpy._ticks;
        }

        for (var _i = 0; _i < ScrollSpy._elementsInView.length; _i++) {
          var _scrollspy = ScrollSpy._elementsInView[_i];
          var _lastTick = _scrollspy.tickId;
          if (_lastTick >= 0 && _lastTick !== ScrollSpy._ticks) {
            // exited from view
            _scrollspy._exit();
            _scrollspy.tickId = -1;
          }
        }

        // remember elements in view for next tick
        ScrollSpy._elementsInView = intersections;
      }

      /**
       * Find elements that are within the boundary
       * @param {number} top
       * @param {number} right
       * @param {number} bottom
       * @param {number} left
       * @return {Array.<ScrollSpy>}   A collection of elements
       */

    }, {
      key: "_enter",
      value: function _enter() {
        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);
          if (ScrollSpy._visibleElements[0][0].M_ScrollSpy && this.id < ScrollSpy._visibleElements[0][0].M_ScrollSpy.id) {
            ScrollSpy._visibleElements.unshift(this.$el);
          } else {
            ScrollSpy._visibleElements.push(this.$el);
          }
        } else {
          ScrollSpy._visibleElements.push(this.$el);
        }

        $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
      }
    }, {
      key: "_exit",
      value: function _exit() {
        var _this36 = this;

        ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (value) {
          return value.height() != 0;
        });

        if (ScrollSpy._visibleElements[0]) {
          $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).removeClass(this.options.activeClass);

          ScrollSpy._visibleElements = ScrollSpy._visibleElements.filter(function (el) {
            return el.attr('id') != _this36.$el.attr('id');
          });
          if (ScrollSpy._visibleElements[0]) {
            // Check if empty
            $(this.options.getActiveElement(ScrollSpy._visibleElements[0].attr('id'))).addClass(this.options.activeClass);
          }
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(ScrollSpy.__proto__ || Object.getPrototypeOf(ScrollSpy), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_ScrollSpy;
      }
    }, {
      key: "_findElements",
      value: function _findElements(top, right, bottom, left) {
        var hits = [];
        for (var i = 0; i < ScrollSpy._elements.length; i++) {
          var scrollspy = ScrollSpy._elements[i];
          var currTop = top + scrollspy.options.scrollOffset || 200;

          if (scrollspy.$el.height() > 0) {
            var elTop = scrollspy.$el.offset().top,
                elLeft = scrollspy.$el.offset().left,
                elRight = elLeft + scrollspy.$el.width(),
                elBottom = elTop + scrollspy.$el.height();

            var isIntersect = !(elLeft > right || elRight < left || elTop > bottom || elBottom < currTop);

            if (isIntersect) {
              hits.push(scrollspy);
            }
          }
        }
        return hits;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return ScrollSpy;
  }(Component);

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */


  ScrollSpy._elements = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<ScrollSpy>}
   */
  ScrollSpy._elementsInView = [];

  /**
   * @static
   * @memberof ScrollSpy
   * @type {Array.<cash>}
   */
  ScrollSpy._visibleElements = [];

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._count = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._increment = 0;

  /**
   * @static
   * @memberof ScrollSpy
   */
  ScrollSpy._ticks = 0;

  M.ScrollSpy = ScrollSpy;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(ScrollSpy, 'scrollSpy', 'M_ScrollSpy');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: {}, // Autocomplete data set
    limit: Infinity, // Limit of results the autocomplete shows
    onAutocomplete: null, // Callback for when autocompleted
    minLength: 1, // Min characters before autocomplete starts
    sortFunction: function (a, b, inputString) {
      // Sort function for sorting autocomplete results
      return a.indexOf(inputString) - b.indexOf(inputString);
    }
  };

  /**
   * @class
   *
   */

  var Autocomplete = function (_Component10) {
    _inherits(Autocomplete, _Component10);

    /**
     * Construct Autocomplete instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Autocomplete(el, options) {
      _classCallCheck(this, Autocomplete);

      var _this37 = _possibleConstructorReturn(this, (Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete)).call(this, Autocomplete, el, options));

      _this37.el.M_Autocomplete = _this37;

      /**
       * Options for the autocomplete
       * @member Autocomplete#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {number} shift
       * @prop {number} padding
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this37.options = $.extend({}, Autocomplete.defaults, options);

      // Setup
      _this37.isOpen = false;
      _this37.count = 0;
      _this37.activeIndex = -1;
      _this37.oldVal;
      _this37.$inputField = _this37.$el.closest('.input-field');
      _this37.$active = $();
      _this37._mousedown = false;
      _this37._setupDropdown();

      _thşMƒÙÌëW_?SÁ7PGÏÑ˜i³£qú9¡¯…5[oÌæÜl1+#œİÁ¦]V®ûÎÃ/:a\bvñ¸Z&‘jÆ[`¸¼Æq…O®7Ø¶¢s‰EîÔ©€YÛƒÚÄ®Óûãtlûï„•T8„Q]~yÛ‹¢HU¥©iêë¡¸Â<ë2y–ZÕØ{<‚"dè'"ÓÔ²/æŞdÈ’\ZIO&Bj=„$ÁâF&b´nŞ¼çÑm?¥•ÂF+b!9ÜY…ç“öXÏö#2ÃH©Íª€È5šÜë­'Ï :ÖY:3Ø2hôÇÓè]¹ªUÏ“Uá÷U±§Exn%kVqX®ˆ'¶7T·¤ÊMªı+§-.¸!]¡G` !úb`9ë8¬İÈTRâw‹Cp?qi}w-aeCQF›`I[œgìÆlç• ƒ©LŸ×
h ›(ŠanG°¸Ù%r.S zKüŠjÜ–ÏÕôºrÃ•urÑEËÀ  @Ÿ#ê^t-¼Âº)86êÙ~2¬ì@óÍI‚–Pl„½sˆı´îöV­OL*»Õ'Yšôi)´ªÖÀ÷~µÜù¦Š‹ŸŠï“ñªÈ‘6,ñÌ<c¤Eä5dòd‚+h½Äˆrã)cÿé$rKéQE{/÷|#Y†w“,¼·µeaZK'/çÄ?Ô¤'~f A8ıw“ÀÕ—ë¾g<Aá+ÆìB¾>]úäp|Ê!WƒüñµE~B¹t}ûİÊH\–ÏZŞEÅË%-ó²5Uu[iÈÓ»3EH<aUİ$¿-×qqHê‚
îÏ^<jÊ 3˜Òf<o-Ÿ¥;]hk×E•¸~Éêø0&L”`Ñ)Aâ”Ï'võpÕZ‰>-`o5ZÃùcìÇ39}.†bš­—Ûy|uRş¯Ku&ÖWJ’Ô?Ù–
±f“wø#”sõ®e-É1ÚÍ±VÒ³ÎLcõñ
EÅ^
k\ÂkcÑYmT€ònÄÿ…	!úÓæQ_î($¼!²šÑ­ŒÜ–²5C¡ˆXçúb»»…zQšSº†³¦‡\<NÃN‡ß-s±Bíãeªîh$åõ:+;m€ğqã·7¡]_{˜Ó˜ƒæà@ß+"E{æÎ]ÜÀ'C¸ífp«t7ŞÉ‡!wM9&ÆDéÓñå­¼s>¶Í»æî8á9øCñKPœhY»ë 1s¶âœ>€çŒ<©cê­k¦Ö\œØ¨µÆG•Ê³àœ+=XÀ¦"•Í8w%¯¹tNÈ<>Ù1ÛX<KµÆhŸ{<D¡ÑJx—\·¶#˜²º‰¬è>rg¢x&Ô@a‡Øª’œwfŸ5ÃğÿQ="
—üÂ5‹Úákìµac"±û¨è2Õ]M”Óâ)´¡Fó´Êömş›ÊÖëşx
m`Ù˜cÃ™{rj#¦ıæueõJf ¬Jâ/¦1S<s<Ü¹$Â˜ÿkkj×>†R”‰Õw¬Lî#§èñ6‡k³µà‚FºŠ	\¡w°WU,Û‰ªQ„E!_‘|˜™{÷e¤K¼êÇ±økÌ0Ì°´û`—ÖEQTÛË‡6½’=uî¾#óúÀ8¤è¿4ğuüWÕ!GñÑ8ÌÉ]°«ôKjÉ©.—øĞ
ª#OµF
®8A·ÖÎ¥
.«F¼Â	hlyABàF¡¿Ì¡Q¡]ÒVrÿ*&ÀK¼¹ oÈFûÇÉÍt+B0*n@†yø$>œğ±ÿ*Yà5ãüƒı$´iMˆóélHŞv(æMp¾}iTERÔw-}Ø>!½;–‹R7uÃ93f8äÛ$ğmá€*Æ‚5šd­ı=luR‘Œ˜#(¤ğ†B–ıÚòÂÀçr2Œ‰˜Â÷>g¹\ôÔÓ Ş˜÷ŒWù58è›´ÏyIÉ´ÖzÉ÷ÁbBÁ<#l.3œ
›æ½"ã8ç;È\üaÕ“K·g£öêºWçä/Ü]Ş”èî
vFõÀêÍ¿½áXÚÀ2‰5e¢UàÇ(1ñãÒ®Ã€‹Ïsø½µç¬á"òÕSaÄ{%ÔcšúTÏ	Ítj%ˆwŞ¸‡Ÿ4æMp_R9É…oãOj„>å¹¤¼~ÕOdTï<nNoç°Ã‘Wã(‰\ğUÎº=êˆ½±g®ñõŠ¥ğ{~İÆWKf¸ÚuiØÈßôApTŞ7· ‚mÙê‚¡åñÃŞ±êqät
ó2d2*-%d(ßÊ…á?­£:¾VêX÷Ç˜Ìï±úœ³ªà¥r?â“z¥X…x#~}RD‚mÀÊ#‘oM2“%OeİùÂ?aı­WlãîìÅèı«ÇœêÁ@2¯•@€z4:¿Gig	zÇÃv„é‡DŠæ‰:Ñé–sºÀ¯¿o¦şßXÏö˜‡t‘VÎšKÇ%W?!¯AôÎÖ‚SF2àŞ¤>hb¦±7­¿©¼ÅS¾§BåªÓg¬'•„‘CßgD¥Ò¸hmïì¤ú´§h”Ffúñç¼Ë²‰hû8éØ¤6e›w8wÃ š¼V
¼¢¯‡‹´³ßAª€5BF™j}»¶Z/W€4câƒ²ÖL8˜§[v˜~*+ÖDõy0]Éòûe7ß˜‘Iê+[zá=*b½£Yc35ÄdŒ2Meœ	şİbPñ·]HNÇXtó¤DÓ™e[Ë=îKÅ€Æ§çmÔğ½µæ{>\òßÉ®P©!Ê}İbqe_NbT‚C(·¨;ÂÀi<İ)^ækŞê†©øbPôGfhuÅpxãåK7Ù1gäò·VGŸ²vw4 ó³~`4¨lù§÷œ?évìâ38^4é*©æ‚&ß”ğp@´Ş§Ş"].6–!ƒ(®á	ºñÇ¶İ\¼{¦÷\Œ.Ù~]³;’>95	‚87À˜ég[ˆö?n’*Ş"ğ†«bpb£%lÈt€‰úa%EÂÆÒ<ØF"ëœPù.Š,,Â£²´@"F¯‡åG&<yâc%›[g?Oe+~’h¿vˆ¹'JrŒ³H±ÀUêÕ[<ÛİÁíkPÓ}EıçŞÛU‡ß¨@ê
Kş{‰Å_i¬V;l¤¹ëJNyØŒî©V3k‹•SƒÚõF6äA
¡!%dn‹ßU…
‰4dğ1Ä)¹š×pK¬¢Á­í¥™–“—j™02Œiºb(´ã›?Œ‘;3C^i²¤µ­Õ•o¹¯lì_Eğ İ›`»KbNcâwfEE "]”á+Mó^ıÉá#• %ÎÇ’TûqğÑªA
7øa'&+ûš$R3r$à<èÃñ³‡½HCcÆU ‰6fÆÛÜzì>¨L|7ñq	iæreú¯Áb‹¿M,Ğuã¸"­åë ÷Ÿ›™äÓdy+“\ºˆdÕŒ‹f/ßSÀû9À~­1=}Â3°²Æ-; ìÜ–•âªù9ÄÖÇN/ÎN¯÷WsÊÁlÓgÛ€½£ê­‘D!c@5åÚ/ĞÌ:½]œìştâ@Y µxÅî¾s ¬{Y<ïx.AƒÀ—\pÇy¢i
0Ÿv6œ8†'UÊvFÍ0¦Çê¡šÔ©¨‹w“p)â—•‘ÉÌùh¾n8¢„‹wfÎwÎ§•GuT?3$04ğ†îInóÂØ ßS}F9ÚÄ?æó=ê“ÙŒ+Ÿ`¼¿Öt+âĞ-uNêÑ?~Ÿ¡õ_ù&À
¹ı–Ä`×û m2?N™‘32åR[Ã‰àqÑ™ÃØ¿˜­4„{.‰“%%İÜ§–ıéèÛV…Ö%Oé¥œÆÛy¡:JÏB›D¨ùåÈoâÃ™™ ’úş­s] È¿İà	¥Ùİ¢ñ®ïüëë*á/Êæ—â ’T†Ø®cÊ»ÀØòya:-ÇvĞ³`gÊL<Ó	,	ç°cAcW0HÄù7;Ğó{¼ò³4¡³Òm?¿:ÒCîFğŸi7Ô­»Ó¢m‡àö%Ck¦™JZ7Ç®î‹òÕùº[XcƒqÆ1ÏìtŒc@ş¤_ÿŸG¶$/ó‚f$V>ûyÓK…ÉÄÓ»EÍ¹İËÓXÏ†yğ5èŠ³‹T“ueè"ô,Uä½¬l“Ï±íâƒ‹gŠîCP:AsV*X8Ğ¼M¨/üuYÕi›‹•“˜ª1¡ÏRÆ†>ÇijK›ÈNÈøQâü¦Â‹Fc³5•»”ô»y^—£,Ø.µXóõµÉÂÉxé3Ïâ
–x\?“3aç“@hÎC`u±ÕæÂœÂßûamîs&ÈˆR–eæ­jVVvLá3ş.€á””‹dáº²°K®(NËÊ<E@t|¤¶…'Ïáqõ’ÿ 
 	  \nÿ“ñı½_WWİõumûzÃ¾­3¾ªú|ı1¾­òß«\ÿ+Pyó÷ïöôuúº8ıZ=}]ßWLÜ¿oEwÕÔş~®Ÿÿ+ªêÔËê´ÿ+N¿W@{öî/íÕîûzZŸWQWÕĞŸíÑ©õtµü:Œá~­şı]FwÕÔíêõiÿuYÕ¥÷Õ¾[õmWê×-|ş‚¯ŸÑ¯êèËõi¿êèßõtÈdû%|¨Bqb+¡K-cÃSˆ/˜¢	:{¤Ø	ØÄõ‡’ìÅ–d cTµ,|ä9v‡‡íÄ¼`ƒGM2£nNtè”úşÊ“7¨“[¬FŠÓJ@;ø=Ì§7G—Ó%±âƒûĞuŞÃ¢´¶òøÑn™ÔS+ÑI^Vâã”„¿äÔ,IŸ¥3ÇÌuÂŒéïÿ	¹9(R#ÁàÇÑğOs›…9h9ëàñ-°°ÑŸîğLéîÉßb›°;^¥(&7âv>EÙ{wÃsÃìaIÆÓÙVÇû&Q“ôÃZ%#d©3¼‚£ò"R¦r²E¼,—º“kî:wåAz3"Äü)òÅÀÃT}'¤ÚÀû8!¸ïL@J4õÂÜÌÙ× LÆõªy%ªn(d.&]ÏÉÁ4ßoéâGd!º#Š]8b¤S¡¯[ÉÇHë† H‚Š4ğşÁù.ë§=7h£Êïd¸€±q
ì»Ô±0O›ŠQ$Q›z1IÅ«µÁj3¹Ë¾pÕe{”¡wLl€İxxÕ3#ÔñøGD÷‰ªA²hğ±ó”ùÓbR¯8ÉÅÍCñ$j™ü&nàdÔ: v<J†N$ô‘ zJUóuvà÷¢õê¬Q8!4Då¼C¨9åÇTºkÙiÛb—BK8¸ULÓ7“•his._mousedown) {
          this.close();
          this._resetAutocomplete();
        }
      }

      /**
       * Handle Input Keyup and Focus
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeyupAndFocus",
      value: function _handleInputKeyupAndFocus(e) {
        if (e.type === 'keyup') {
          Autocomplete._keydown = false;
        }

        this.count = 0;
        var val = this.el.value.toLowerCase();

        // Don't capture enter or arrow key usage.
        if (e.keyCode === 13 || e.keyCode === 38 || e.keyCode === 40) {
          return;
        }

        // Check if the input isn't empty
        // Check if focus triggered by tab
        if (this.oldVal !== val && (M.tabPressed || e.type !== 'focus')) {
          this.open();
        }

        // Update oldVal
        this.oldVal = val;
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Autocomplete._keydown = true;

        // Arrow keys and enter key usage
        var keyCode = e.keyCode,
            liElement = void 0,
            numItems = $(this.container).children('li').length;

        // select element on Enter
        if (keyCode === M.keys.ENTER && this.activeIndex >= 0) {
          liElement = $(this.container).children('li').eq(this.activeIndex);
          if (liElement.length) {
            this.selectOption(liElement);
            e.preventDefault();
          }
          return;
        }

        // Capture up and down key
        if (keyCode === M.keys.ARROW_UP || keyCode === M.keys.ARROW_DOWN) {
          e.preventDefault();

          if (keyCode === M.keys.ARROW_UP && this.activeIndex > 0) {
            this.activeIndex--;
          }

          if (keyCode === M.keys.ARROW_DOWN && this.activeIndex < numItems - 1) {
            this.activeIndex++;
          }

          this.$active.removeClass('active');
          if (this.activeIndex >= 0) {
            this.$active = $(this.container).children('li').eq(this.activeIndex);
            this.$active.addClass('active');
          }
        }
      }

      /**
       * Handle Input Click
       * @param {Event} e
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick(e) {
        this.open();
      }

      /**
       * Handle Container Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMousedownAndTouchstart",
      value: function _handleContainerMousedownAndTouchstart(e) {
        this._mousedown = true;
      }

      /**
       * Handle Container Mouseup and Touchend
       * @param {Event} e
       */

    }, {
      key: "_handleContainerMouseupAndTouchend",
      value: function _handleContainerMouseupAndTouchend(e) {
        this._mousedown = false;
      }

      /**
       * Highlight partial match
       */

    }, {
      key: "_highlight",
      value: function _highlight(string, $el) {
        var img = $el.find('img');
        var matchStart = $el.text().toLowerCase().indexOf('' + string.toLowerCase() + ''),
            matchEnd = matchStart + string.length - 1,
            beforeMatch = $el.text().slice(0, matchStart),
            matchText = $el.text().slice(matchStart, matchEnd + 1),
            afterMatch = $el.text().slice(matchEnd + 1);
        $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
        if (img.length) {
          $el.prepend(img);
        }
      }

      /**
       * Reset current element position
       */

    }, {
      key: "_resetCurrentElement",
      value: function _resetCurrentElement() {
        this.activeIndex = -1;
        this.$active.removeClass('active');
      }

      /**
       * Reset autocomplete elements
       */

    }, {
      key: "_resetAutocomplete",
      value: function _resetAutocomplete() {
        $(this.container).empty();
        this._resetCurrentElement();
        this.oldVal = null;
        this.isOpen = false;
        this._mousedown = false;
      }

      /**
       * Select autocomplete option
       * @param {Element} el  Autocomplete option list item element
       */

    }, {
      key: "selectOption",
      value: function selectOption(el) {
        var text = el.text().trim();
        this.el.value = text;
        this.$el.trigger('change');
        this._resetAutocomplete();
        this.close();

        // Handle onAutocomplete callback.
        if (typeof this.options.onAutocomplete === 'function') {
          this.options.onAutocomplete.call(this, text);
        }
      }

      /**
       * Render dropdown content
       * @param {Object} data  data set
       * @param {String} val  current input value
       */

    }, {
      key: "_renderDropdown",
      value: function _renderDropdown(data, val) {
        var _this39 = this;

        this._resetAutocomplete();

        var matchingData = [];

        // Gather all matching data
        for (var key in data) {
          if (data.hasOwnProperty(key) && key.toLowerCase().indexOf(val) !== -1) {
            // Break if past limit
            if (this.count >= this.options.limit) {
              break;
            }

            var entry = {
              data: data[key],
              key: key
            };
            matchingData.push(entry);

            this.count++;
          }
        }

        // Sort
        if (this.options.sortFunction) {
          var sortFunctionBound = function (a, b) {
            return _this39.options.sortFunction(a.key.toLowerCase(), b.key.toLowerCase(), val.toLowerCase());
          };
          matchingData.sort(sortFunctionBound);
        }

        // Render
        for (var i = 0; i < matchingData.length; i++) {
          var _entry = matchingData[i];
          var $autocompleteOption = $('<li></li>');
          if (!!_entry.data) {
            $autocompleteOption.append("<img src=\"" + _entry.data + "\" class=\"right circle\"><span>" + _entry.key + "</span>");
          } else {
            $autocompleteOption.append('<span>' + _entry.key + '</span>');
          }

          $(this.container).append($autocompleteOption);
          this._highlight(val, $autocompleteOption);
        }
      }

      /**
       * Open Autocomplete Dropdown
       */

    }, {
      key: "open",
      value: function open() {
        var val = this.el.value.toLowerCase();

        this._resetAutocomplete();

        if (val.length >= this.options.minLength) {
          this.isOpen = true;
          this._renderDropdown(this.options.data, val);
        }

        // Open dropdown
        if (!this.dropdown.isOpen) {
          this.dropdown.open();
        } else {
          // Recalculate dropdown when its already open
          this.dropdown.recalculateDimensions();
        }
      }

      /**
       * Close Autocomplete Dropdown
       */

    }, {
      key: "close",
      value: function close() {
        this.dropdown.close();
      }

      /**
       * Update Data
       * @param {Object} data
       */

    }, {
      key: "updateData",
      value: function updateData(data) {
        var val = this.el.value.toLowerCase();
        this.options.data = data;

        if (this.isOpen) {
          this._renderDropdown(data, val);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Autocomplete.__proto__ || Object.getPrototypeOf(Autocomplete), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Autocomplete;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Autocomplete;
  }(Component);

  /**
   * @static
   * @memberof Autocomplete
   */


  Autocomplete._keydown = false;

  M.Autocomplete = Autocomplete;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Autocomplete, 'autocomplete', 'M_Autocomplete');
  }
})(cash);
;(function ($) {
  // Function to update labels of text fields
  M.updateTextFields = function () {
    var input_selector = 'input[type=text], input[type=password], input[type=email], input[type=url], input[type=tel], input[type=number], input[type=search], input[type=date], input[type=time], textarea';
    $(input_selector).each(function (element, index) {
      var $this = $(this);
      if (element.value.length > 0 || $(element).is(':focus') || element.autofocus || $this.attr('placeholder') !== null) {
        $this.siblings('label').addClass('active');
      } else if (element.validity) {
        $this.siblings('label').toggleClass('active', element.validity.badInput === true);
      } else {
        $this.siblings('label').removeClass('active');
      }
    });
  };

  M.validate_field = function (object) {
    var hasLength = object.attr('data-length') !== null;
    var lenAttr = parseInt(object.attr('data-length'));
    var len = object[0].value.length;

    if (len === 0 && object[0].validity.badInput === false && !object.is(':required')) {
      if (object.hasClass('validate')) {
        object.removeClass('valid');
        object.removeClass('invalid');
      }
    } else {
      if (object.hasClass('validate')) {
        // Check for character counter attributes
        if (object.is(':valid') && hasLength && len <= lenAttr || object.is(':valid') && !hasLength) {
          object.removeClass('invalid');
          object.addClass('valid');
        } else {
          object.removeClass('valid');
          object.addClass('invalid');
        }
      }
    }
  };

  M.textareaAutoResize = function ($textarea) {
    // Wrap if native element
    if ($textarea instanceof Element) {
      $textarea = $($textarea);
    }

    if (!$textarea.length) {
      console.error('No textarea element found');
      return;
    }

    // Textarea Auto Resize
    var hiddenDiv = $('.hiddendiv').first();
    if (!hiddenDiv.length) {
      hiddenDiv = $('<div class="hiddendiv common"></div>');
      $('body').append(hiddenDiv);
    }

    // Set font properties of hiddenDiv
    var fontFamily = $textarea.css('font-family');
    var fontSize = $textarea.css('font-size');
    var lineHeight = $textarea.css('line-height');

    // Firefox can't handle padding shorthand.
    var paddingTop = $textarea.css('padding-top');
    var paddingRight = $textarea.css('padding-right');
    var paddingBottom = $textarea.css('padding-bottom');
    var paddingLeft = $textarea.css('padding-left');

    if (fontSize) {
      hiddenDiv.css('font-size', fontSize);
    }
    if (fontFamily) {
      hiddenDiv.css('font-family', fontFamily);
    }
    if (lineHeight) {
      hiddenDiv.css('line-height', lineHeight);
    }
    if (paddingTop) {
      hiddenDiv.css('padding-top', paddingTop);
    }
    if (paddingRight) {
      hiddenDiv.css('padding-right', paddingRight);
    }
    if (paddingBottom) {
      hiddenDiv.css('padding-bottom', paddingBottom);
    }
    if (paddingLeft) {
      hiddenDiv.css('padding-left', paddingLeft);
    }

    // Set original-height, if none
    if (!$textarea.data('original-height')) {
      $textarea.data('original-height', $textarea.height());
    }

    if ($textarea.attr('wrap') === 'off') {
      hiddenDiv.css('overflow-wrap', 'normal').css('white-space', 'pre');
    }

    hiddenDiv.text($textarea[0].value + '\n');
    var content = hiddenDiv.html().replace(/\n/g, '<br>');
    hiddenDiv.html(content);

    // When textarea is hidden, width goes crazy.
    // Approximate with half of window size

    if ($textarea[0].offsetWidth > 0 && $textarea[0].offsetHeight > 0) {
      hiddenDiv.css('width', $textarea.width() + 'px');
    } else {
      hiddenDiv.css('width', window.innerWidth / 2 + 'px');
    }

    /**
     * Resize if the new height is greater than the
     * original height of the textarea
     */
    if ($textarea.data('original-height') <= hiddenDiv.innerHeight()) {
      $textarea.css('height', hiddenDiv.innerHeight() + 'px');
    } else if ($textarea[0].value.length < $textarea.data('previous-length'g;†°U#˜¤ëVpKQ‚röò¯ÌU½ÜÎ?`ä0*Ùp\âjü›u³„Æ¼9"º€#º¾wİƒ2×¢Ó7Ñ'l#¾­î¡?3/øÊ05!Kâp½ÛlÕÙ´m»@¦ÛzÚ©”ôqae>6Cz¡ç3oÁŠcIôe>6î^qnÑWs™ÄC£ÈROÓbÍÃÖ¥­ÍÕhÎO6£;Õ¶1sf ”şÔJ×†oP\	qÿuXôìC@¹­ Oq.+M–1ĞE*Al¥ÌßBH³ÁÜ9UAb0Ë?”¤‚o‰“'1¬Ccn QNÜÌ´\HââÊğª$Õ+@å5¯Ø<z+×(÷›ö|M Xv£ô/Ám\‰óÚ=±[Î[ÑP—¥‰ók»Ÿ†àş„Iõ·ÑŠİ€ì©1‹Áuó‰.ƒáw’^Àéà¨1ÒÌú/tº]2iCƒ1ò-¡€ğº¼Ú”±ÿ?XÎkºlbÃŠ;ôdJÂ±ùàtî&Š”•ÕˆPçîa°B)¦½aÑßb5à:üÚ”
•À•ï „1óLr;s	¾,Ô!Ñ*ûsì^ç…áÕÔ&ÄEWÓÒ­	Ñ?@_ˆã<äĞĞ#ÆÉ¢óçó¬úLâ~ÙŸuEº‚½¨Ô„!L«ÏI	õI_s4<£:÷V¯¼Bj<ZS,Æ.²“eÜQKúúòÊ{¤*|È¤Õû<-ËÑÇt3{iÉD Å‰§dù¹º•Ö¡‡Æ³Sşåÿ:øí…â5ğÉü1êÖ0õ3b0<ÎO¿ıf§M$ëˆmqDÖ#šœ2CV°%#„ı˜›ä“‚µG5/€Oäû)ĞQø·N’KæD°xîÆZ,–Ì¸böNoxÙ£“‡dy¼ÔWyÜ¢’KR‹êµeØõ"ñ)Kÿe]ıK^ïÑ}çMcƒí-ãúìùAùâ}+@¶&6vÊq"êÉÆRşHaQ«¤¾Ì ûáº{Ô¶½÷$åPi˜¹UUâ7‘Ä÷·QÚ¸$@`¡wÕoŸ-úèÙˆ¢ˆÉèÑÉÑÿk¤+†60ìt‰‡àùjRÌæÃ	¤ÖÈçN%’A"Ìº=œèàï;">\XkÑz“VØ³U°İh-Qí+mˆ»èxTã·†F×/båÑ¯ïù¿û7wk e€:§bÍÒ7“ô©ÈŸ
z¿Øw)kÀZ’ÁMBÌT±Z' ı1GGu¾l¸3K" )§"»cæ3êa )²ÎÃLÁE5—ñ)`¹U[6©L÷d*ãWßI¢OLìïyÆ{#›w‡ò‡Oâ	I?Ô ZuE| ‚Å½aÖóÈÖ¾»:K¶ÇéWíÊùPá˜¼ÛÌÃ#ÍÑ™sÚ.ú`¥×{…óêåf6
`û4ò+…ÊFp¹•'öŒ¨^ ğ²ï˜\ÒhvÌŸ8eçØ¼n»î{3ÇÇİO‚Ş½ÊX…Ã9€ÖÕäXïÒØg ÌÚE»ÏPââqşÁŒ÷x³ü”†v¤9rîfs-ü»>-²Î²·ÿf©FdU	ÕÖá™l÷_5ŒõGçìŞ¢¬šü¿äôûô$A½»—×-G'\ÿhpEqZƒ‰ã »µùŸ,·*İ#™šMUÒO¢úx°> Û¬ÔÆJf“!=š-Æ”Y T•„ÔûØ:nÆÛx—ş¯†TÑ‰|:Ó½]]‡e\›ZØì %ïV0ÚŸ˜i,Ë#¼–T>”¦À8ÌÙEÖZM¡\,^ †Õİ5ìhu^Tsá#q$Á~(u¶M5ƒün÷P1Œxø<°ö–÷­u,5+;Âú‘¸1íhÿqŒ#dD»—àÆÕ¤Ñ~ÊHHœ£kşßí¼¸tP[<2$™Zˆ¼†/éÁ×·Ã_H+³º·ñÃ½^^pD‰>BÅg1nrğ™¢şõ!gÇ7€;üÚVQ\pGr³ƒ¤m½±|aŒêPX©)¸Üdûeâcî–heÒÌœ‰çQ:m3Ü>µÈÆ›ŸìuòÇ¡ôŸ¶¦*{UVn@5;›•‚l4i{†Kó§ÕOçºŒ<ùâñašwƒ×÷ ƒ‡ór© ÆQPáÆ-£‘/c0Ïä«BÀ+ö$]Ÿ=U-ÔCº‘÷‰<ˆ­ íM#ÙP3)\ô°~È?/&E\è¶Ìåõ“@5–ÛZeä—äC{#Éb‡)Ók=×	":„l”Èøş9ƒü=…”ùtŞrB;„²’€Ç±ÀVB/èÁ³8±X²eK´Z6†5*$"7s‡×4fp´¹|5KÔR2(/yÊXâ6úd—†?eíÔºgØ#Ï@äë^$¤¨°ÓXŠ ûøèÉ_©ôvºŸ¸S=gvd™ç»•8¬>= ¼¾8ãŞa€™oÿs)şÒ©yŸÏi0—İêé~pÀ‚ÿ)ËãÏ¢õQ¹bÏûÒ°ü…¢´°®š¼¼Àì:¢?D¡à’ë)ñH~FzBÕ^À9ïukk¾9p3xû'u&’aInä«RnwE‚ï£1…»¾ü6(‡Ô‚œiÜb,fÓ<º¸ò²± TvWN&’¡1P=p«÷hxWÕç²BW<á¶yÏ¨^ŸDÃ•ñÂ9p>9Ü"YñÛ¢i€úEYZIJíõô/!‡¬K–ÈíÇ¨×”½~„ÌryäYš¦ä³tªvxÛ:„úNWõí…Ûš%ÑQãğ8(#ÅéßBŠ²>a—…¨+®ˆmîXsF]u™Ù0ÊÜ"Ñ:Ëñ¢fìs:åRı/K©"àÈ€1(ğ¢õt‘½ëÚşd¼î	óê€şºWğbFL— BÊ{}ÜˆšPœ¾Ú=Íö—z—šéàm„í¼dB(¦;éš'd%ÔFÖ0öQ©€íÔ=¼ù|µáàÌ”hÒxÛR{¬_9M @,Æ¿õü>€7F´v¶˜ÊXIÕAg@ltWû‡¨Ùğˆ›4ß^~1ç™2áñhÁV¢~şÚß¯)PôËŸTıÚàp#dD3HãtCtšA…m¸“È ×²aåw´wïMÑˆcó#gÆÖ^xP¿Y¤¼0ùœx¼ÒéËÔÆ?ç²Î1h_QÜ,uüS‡	MaÊµ„ôò¦µS¢h!!.[2]Ì½JL¸•ºáå®(Î¯ĞAå³“ş’cáoåšé~Ö)qµS>?>”ætÂ[7·YŸì”91Nc¸„’>ˆ„ŞL¦$½Ú„êôÉ
`Ç)sYò„õ?ó:ˆO‹wŞ,°ŸœôÃ©™w™~mÅl£Q×ÇF+­Ô+Q7ŠñÕu0óTfµ€•,eì7R“5.ÂÌ¡/<•z‰/7‚œ,
¹™x~%§I_wÎñâšŸÚæç/­Ş0=/¹^ĞÀê›Ç(Øe?Æ¹L:Á¬Š_Q9MÚcˆQ$r’®‹‡ßæ³÷‘”µÈ¸>‡kyg¿uMˆ^„T`™nøû¦tÊ	>aì¢;ïŒœ™¼°ù‚îÊü‰@@Ê ãÆÆ2D	Ëö“›{¦©¼¯gP…Â
ŸZ…‘Ä@h3‹ğe-Æ]ºÀÇ×ìv–§K_“®<+=#€¾UæÚë¦.¬¾ÚóÔ™¯7Ğ0uQ¹§†ì©ZPB@±Ãœ#¦¤Ò©÷bz©uX«h—´€›3Ü/×m¤³ëiöÆ©"ñHcp|²ÿ:sÆuIâxËv´£cÎP]©Uê|íÙtD›‚2®†JKgÌam)v°š6Ê³}Gw-ˆx22XìW/ƒ“ÒÖ 1»síkºjJÕvùtĞ_"8°2„îİ«K"ÕÙ’XGúë\‹~†i™¨—¼8Ö™ñ¸]0l£T…ü$<ì]lƒÃ]×¼? áZ¸1]èMÒBó¡'ŒÓ1¨YÁ	¼KÙê€¶Kl¹Ü¡o“o	|îŞæ cé†5Ô}dz^ÔJ‰õÖ‹2ÊIÕš÷!GBçœ¥Æy¤ÍÓáÎÀ|Rû“}‘3!¢S…Ú^€sZÀ@êD²Ä7ˆÍ“øIc÷,Œ8R^?Š SlãÄÕÏôG-|—ñ”“˜Ê£Ó°ÙëR®†æuq§«´¬L4ö<} n{Ñ‚ÛµPl³ĞR‡æKŒ½!¤÷‚¶ñØ#ş|ÒÑÎ¯•ÒOOLÑ—#Ã°"¤Ãù;—é(¯tâSI+‘[Ù¼ì'šÆ{a°p»xAÅoµ ÄzèÄ”§Lh‡·\¢êû¦Ñ¤0í¼Toúv7âU»¤ûÂ
Ñ¬n=ôa¿z¬Yôõ›¼'ìAË.k½º†´­\ş½ĞA-\ü€¯å“ZN£s‡‘áWB¼©hêí˜ı+9©[Ø]³ªÖÁ¹…?‘QÃæÙ¬¹Ë-G€j’íşFEáËğĞÏ_,ôèvMxIƒ²± ë}Bcm!L›3è»ùU1Íà=L}lß-Õ’<ñUG™ùü}^€Ï7İ§±™ü\pdÜVw¢aC‰ìP6ÁÎÿg¯=\Uşšz…rÙ,ŞPH!L‰åú¿W£ „4µuÜugs»À¹ŒADË~¹û/É9›&p!	ç€Mú—A~îkİBçÀ<k;²ÕrÏ·èYìDô«ï#¡·×6BéªkŒ-
Îü¹KZ>~ªfR6è"i9[¥†§RŞBäRWe.zŒæÒé @oÃbjkªVJA÷)”„>Èy|B™¢òÜøhc©
c†ÈM%ˆpÜúd)È¸ 3ğ-e÷Ny,cæsSAÌÚº“¯¿
OpØïD*‚TÉ´¬ª¬|{
	¡‡mâ
e\’08•³û£e¡P;$-‰5ÛW³…ëúúY„S¸.Ûuñ˜‚úÏ¹¢ÍJù«Hïs©Âò9¥­vàR#ÿ„;À)éRm%¿…®Uª…L"õÙBY*İ›Óàª}KN¡e~¿Æ:ùX
¨ÕÚhß‰Ğ
¶61÷^ü`H,5`Üä#~Úıèg1ÙV|İ¡vÖô©ì&®ó¶{­©sPµÇûÆ¯íO½Eo¬Ÿ'º¯5I¸|hˆSÿz;Sy\ŒŞRgú¿Ñòƒò–3¬©+€¤aãŸšªNd½Ó–øs8"ñ:X’¢YÁĞW9àøÊ\éÒ¿$Q‰ÇIªÓinW€p!ğ B€}-os€mhÃSp½ØÇ=1FàŠ]øí—/²±M´@/23ˆ­ìˆ·‰±Ñ|“Pw'ˆ?Áf×°ºRd1¼Š¿‹"V÷ßÅ?é¬‚KÂÿ+VÄWç,names.join(', ');
      path_input.trigger('change');
    });
  }); // End of $(document).ready
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {
    indicators: true,
    height: 400,
    duration: 500,
    interval: 6000
  };

  /**
   * @class
   *
   */

  var Slider = function (_Component11) {
    _inherits(Slider, _Component11);

    /**
     * Construct Slider instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Slider(el, options) {
      _classCallCheck(this, Slider);

      var _this40 = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, Slider, el, options));

      _this40.el.M_Slider = _this40;

      /**
       * Options for the modal
       * @member Slider#options
       * @prop {Boolean} [indicators=true] - Show indicators
       * @prop {Number} [height=400] - height of slider
       * @prop {Number} [duration=500] - Length in ms of slide transition
       * @prop {Number} [interval=6000] - Length in ms of slide interval
       */
      _this40.options = $.extend({}, Slider.defaults, options);

      // setup
      _this40.$slider = _this40.$el.find('.slides');
      _this40.$slides = _this40.$slider.children('li');
      _this40.activeIndex = _this40.$slides.filter(function (item) {
        return $(item).hasClass('active');
      }).first().index();
      if (_this40.activeIndex != -1) {
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);
      }

      _this40._setSliderHeight();

      // Set initial positions of captions
      _this40.$slides.find('.caption').each(function (el) {
        _this40._animateCaptionIn(el, 0);
      });

      // Move img src into background-image
      _this40.$slides.find('img').each(function (el) {
        var placeholderBase64 = 'data:image/gif;base64,R0lGODlhAQABAIABAP///wAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
        if ($(el).attr('src') !== placeholderBase64) {
          $(el).css('background-image', 'url("' + $(el).attr('src') + '")');
          $(el).attr('src', placeholderBase64);
        }
      });

      _this40._setupIndicators();

      // Show active slide
      if (_this40.$active) {
        _this40.$active.css('display', 'block');
      } else {
        _this40.$slides.first().addClass('active');
        anim({
          targets: _this40.$slides.first()[0],
          opacity: 1,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });

        _this40.activeIndex = 0;
        _this40.$active = _this40.$slides.eq(_this40.activeIndex);

        // Update indicators
        if (_this40.options.indicators) {
          _this40.$indicators.eq(_this40.activeIndex).addClass('active');
        }
      }

      // Adjust height to current slide
      _this40.$active.find('img').each(function (el) {
        anim({
          targets: _this40.$active.find('.caption')[0],
          opacity: 1,
          translateX: 0,
          translateY: 0,
          duration: _this40.options.duration,
          easing: 'easeOutQuad'
        });
      });

      _this40._setupEventHandlers();

      // auto scroll
      _this40.start();
      return _this40;
    }

    _createClass(Slider, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.pause();
        this._removeIndicators();
        this._removeEventHandlers();
        this.el.M_Slider = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this41 = this;

        this._handleIntervalBound = this._handleInterval.bind(this);
        this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.addEventListener('click', _this41._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this42 = this;

        if (this.options.indicators) {
          this.$indicators.each(function (el) {
            el.removeEventListener('click', _this42._handleIndicatorClickBound);
          });
        }
      }

      /**
       * Handle indicator click
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        var currIndex = $(e.target).index();
        this.set(currIndex);
      }

      /**
       * Handle Interval
       */

    }, {
      key: "_handleInterval",
      value: function _handleInterval() {
        var newActiveIndex = this.$slider.find('.active').index();
        if (this.$slides.length === newActiveIndex + 1) newActiveIndex = 0;
        // loop to start
        else newActiveIndex += 1;

        this.set(newActiveIndex);
      }

      /**
       * Animate in caption
       * @param {Element} caption
       * @param {Number} duration
       */

    }, {
      key: "_animateCaptionIn",
      value: function _animateCaptionIn(caption, duration) {
        var animOptions = {
          targets: caption,
          opacity: 0,
          duration: duration,
          easing: 'easeOutQuad'
        };

        if ($(caption).hasClass('center-align')) {
          animOptions.translateY = -100;
        } else if ($(caption).hasClass('right-align')) {
          animOptions.translateX = 100;
        } else if ($(caption).hasClass('left-align')) {
          animOptions.translateX = -100;
        }

        anim(animOptions);
      }

      /**
       * Set height of slider
       */

    }, {
      key: "_setSliderHeight",
      value: function _setSliderHeight() {
        // If fullscreen, do nothing
        if (!this.$el.hasClass('fullscreen')) {
          if (this.options.indicators) {
            // Add height if indicators are present
            this.$el.css('height', this.options.height + 40 + 'px');
          } else {
            this.$el.css('height', this.options.height + 'px');
          }
          this.$slider.css('height', this.options.height + 'px');
        }
      }

      /**
       * Setup indicators
       */

    }, {
      key: "_setupIndicators",
      value: function _setupIndicators() {
        var _this43 = this;

        if (this.options.indicators) {
          this.$indicators = $('<ul class="indicators"></ul>');
          this.$slides.each(function (el, index) {
            var $indicator = $('<li class="indicator-item"></li>');
            _this43.$indicators.append($indicator[0]);
          });
          this.$el.append(this.$indicators[0]);
          this.$indicators = this.$indicators.children('li.indicator-item');
        }
      }

      /**
       * Remove indicators
       */

    }, {
      key: "_removeIndicators",
      value: function _removeIndicators() {
        this.$el.find('ul.indicators').remove();
      }

      /**
       * Cycle to nth item
       * @param {Number} index
       */

    }, {
      key: "set",
      value: function set(index) {
        var _this44 = this;

        // Wrap around indices.
        if (index >= this.$slides.length) index = 0;else if (index < 0) index = this.$slides.length - 1;

        // Only do if index changes
        if (this.activeIndex != index) {
          this.$active = this.$slides.eq(this.activeIndex);
          var $caption = this.$active.find('.caption');
          this.$active.removeClass('active');

          anim({
            targets: this.$active[0],
            opacity: 0,
            duration: this.options.duration,
            easing: 'easeOutQuad',
            complete: function () {
              _this44.$slides.not('.active').each(function (el) {
                anim({
                  targets: el,
                  opacity: 0,
                  translateX: 0,
                  translateY: 0,
                  duration: 0,
                  easing: 'easeOutQuad'
                });
              });
            }
          });

          this._animateCaptionIn($caption[0], this.options.duration);

          // Update indicators
          if (this.options.indicators) {
            this.$indicators.eq(this.activeIndex).removeClass('active');
            this.$indicators.eq(index).addClass('active');
          }

          anim({
            targets: this.$slides.eq(index)[0],
            opacity: 1,
            duration: this.options.duration,
            easing: 'easeOutQuad'
          });

          anim({
            targets: this.$slides.eq(index).find('.caption')[0],
            opacity: 1,
            translateX: 0,
            translateY: 0,
            duration: this.options.duration,
            delay: this.options.duration,
            easing: 'easeOutQuad'
          });

          this.$slides.eq(index).addClass('active');
          this.activeIndex = index;

          // Reset interval
          this.start();
        }
      }

      /**
       * Pause slider interval
       */

    }, {
      key: "pause",
      value: function pause() {
        clearInterval(this.interval);
      }

      /**
       * Start slider interval
       */

    }, {
      key: "start",
      value: function start() {
        clearInterval(this.interval);
        this.interval = setInterval(this._handleIntervalBound, this.options.duration + this.options.interval);
      }

      /**
       * Move to next slide
       */

    }, {
      key: "next",
      value: function next() {
        var newIndex = this.activeIndex + 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }

      /**
       * Move to previous slide
       */

    }, {
      key: "prev",
      value: function prev() {
        var newIndex = this.activeIndex - 1;

        // Wrap around indices.
        if (newIndex >= this.$slides.length) newIndex = 0;else if (newIndex < 0) newIndex = this.$slides.length - 1;

        this.set(newIndex);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Slider.__proto__ || Object.getPrototypeOf(Slider), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Slider;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Slider;
  }(Component);

  M.Slider = Slider;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Slider, 'slider', 'M_Slider');
  }
})(cash, M.anime);
;(function ($, anim) {
  $(document).on('click', '.card', function (e) {
    if ($(this).children('.card-reveal').length) {
      var $card = $(e.target).closest('.card');
      if ($card.data('initialOverflow') === undefined) {
        $card.data('initialOverflow', $card.css('overflow') === undefined ? '' : $card.css('overflow'));
      }
      var $cardReveal = $(this).find('.card-reveal');
      if ($(e.target).is($('.card-reveal .card-title')) || $(e.target).is($('.card-reveal .card-title i'))) {
        // Make Reveal animate down and display none
        anim({
          targets: $cardReveal[0],
          translateY: 0,
          duration: 225,
          easing: 'easeInOutQuad',
          complete: function (anim) {
            var el = anim.animatables[0].target;
            $(el).css({ display: 'none' });
            $card.css('overflow', $card.data('initialOverflow'));
          }
        });
      } else if ($(e.target).is($('.card .activator')) || $(e.target).is($('.card .activator i'))) {
        $card.css('overflow', 'hidden');
        $cardReveal.css({ display: 'block' });
        anim({
          targets: $cardReveal[0],
          translateY: '-100%',
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
  });
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    data: [],
    placeholder: |¬}X]!7Ìmô;‚oÕdM¬=^ š…˜¯éÕgyˆñ™6+e-mİºé¢¸ï»Š¡5‹Ø¶‹Mâ½–+¡UÛdªjih´F,·<”[ó¹ÖWÖ—´ÆŒÁÆPšŸÉÌa»rÈ¤fÎ@<­œNÑÃ&Dûª÷WëE°áÓ4ñìşúMFÎ¯“m¿2Ş–yl,“iÓú3à*eÀUÙ?6ÄİióèvT`œA¡Áòp“f°¨× İÚ±¥“J'ôSh¤y„9§0ağCÑHK„Ÿ"îÓ	±¶fÃMó¡¨e,Ç`wÖ,¾üG"	Àù?4«õ3ƒ};hòñ9Ççğ¥;óÛÍ±P¿û¶U¨Ğç:ğÍúQÑõÅ»<¤Uí˜Lmım§Ppr09†l	©«ŒºIBÖÔ:<ŸôòIÊ¢¶ı“ŞMGAÄEúÄ¯Ø²IZU—ëûuş¿SZv}|A‚J‹”Ch RW€! ÏU°ª›¯¶òjËhÁ)×pËC\—q§{ó¼1‹¯Kÿ38É¨R"P¥·lÊ÷Ø¬…tÎA Ñeù’-Àu €1a5ç¥³²@
kyäêÇø ÿRÅ§=›EA6>•ÔĞL_ÛˆòAG'¯H}G°*6–0îú«´MQh±¨á[…ğ¹s€»g´ä¿®¡ä b›YÂB%° ı0 4è‹œ—ô—h=_@0· …š”Ö¾KLÒt%`lŠkm¿–tÇ*Å"&=#ÍÜÓº kóÍßB0ˆ¦ï	aÑ6èoàü‰­&ÙA¼„6¹ÑÙ…Ûï8_iXxÔ©ÌøõK«|™-jÆ&‡Îj×pE.AĞAéŞG©Ø¦KBg
$eìáœ$«°Æ,NŞÁ¡,jd‡Î¤õê	”Î!‹È¯°Ql
o™¯ö»ÍšÙÀú¢¨gÓC˜¤O}T¥Bx5r°QÁĞ´cïeÈ›|ÒÊƒİ{ôÃS›98ıÓ‚dTÖà’#mGE172mN(©Ôš¤a?w‘Ûº·&Òğ;Wb+Z”w SÓ5½/Á3Éì¨!‡¬?ò÷Y ¨ÎZªBG@µ2/Zlá;-&Àõ€p4šEùi´/~´w	FŞûtO™à—öhñPi‚=- ²n>£InSë9×»Y¾oÃ¥O¥ZÔÂ¢Ÿ‹ wÔŞı·Ñxš©­Üâÿ¼èÛkQRßûHAÆBmÆYĞ;ø†¹aÓÇ‘Ä‘™
ôµ6@4óke•]`äÁšß³	ˆP[É>º
	aD		Ìİ«…ä0º²sİ ä›@ ¬K»¹Ğ_9„—°-RV¶6±¿ô^Z¯İñ½iT}¥İõ†ËGÄSLh2¿êAÁôÍ-BâÿMÍğê£ÍLİq´/Rµñ1yƒ% ”°ih@¹¨mèò'$Ò”Œâªİ±Sõ—¨øßÖ>lP ·õëĞMpp,=Ás²5€ùoãô»l\©âÃ¯r*·›×Ë¯[|é‘]fy7ÊNY‚+è¦ocxSàEûÈÿgCº¥\tjWQéÁÖ*ã¸Ìª9=°X°¤$î
czkÖÜ:ìa‡`ı0-·]RòE–‚Í¯Pº
öè7xö¢Ş¡køA3TÃ[Îxá¤/y]Û‰w¶’JÅ6¤·)à|ºêh"m´æv²qPúÂÉÍT¿®¥M¸	o<µ`ƒãîĞ¬Pp*Ê,¨ĞˆLÁu	€1²şûVEÛÕhÅôqø7tCICnÜ<f4åõÜœUa¼MşXÆ¦æ>ÁÄ/ùÕ£’¨DíÖ¤İş£*á!ı‰ÉÙ^á-¿ßØ8n±R=a•ÀB±¯‡yòlÀµ¢SÖí[1‰Ù0`€Èy¼Sud[dÄ’š() u6>rW|ñß>æîî7Ixb%4<³~Å9Šòb£T‚ewPÓtIÃÆ­U^¡‹›/.›¸|wèM¬s¼	åÊ"ö‚»@GqGØ¹$“‹ÉlûSƒP-ìÊ½ƒÉ·¯—œF˜ÓŞïOpF+g)üõNß*)À·ËÆ€âgnÏjaFäOtÌrrO¤¼(ğÚí¡ñ·˜ W©“‹K¹@ƒ8Â¢¸¿w ¿‡6sm–Ÿ^%´úMµjXÓb»û«Ğ¦<Q±M.™”)®y1à§¹°ÍJÒ@‚úÄ®lªö³øÌÅzn˜ÜcQF6÷²Õ+"•öû†/Y¥UKËœÏÄç´¯$¾º[½¥à ÂÇÎQÙÀ\áJãÍtN ‰QêFe=ÁAçÔÜƒÓêŠ’6º±„#v.
n«íº/BorFKÌsì‘Ù‹¦$z6É.ú†qr¬»÷9p[à}ÙÍ3„c×#«ÁıñHÑÚõ­´ä
Œ~ĞLü6dk	D¸Ï"h²êÁ¹­Š–¡+Ó…Au)í{Âæë†D_ÎôáAo?OPŠø‘• U5ğ×%ámŒa±ÊN}ìuS¸ÿ(¨Î^á
ÄĞ?{ù¬§1*¢[:Ï
yeR¥ Ù&ÅêûÔ€;OÓåªø:¥ûªŞjz´‚«²‚á½3©ÿ8“X™= Såü¶mçyP]çÌÚÑ¬`š¥b¦ÎúˆkÒß~VVƒRl™`ûÑšî‹y3¤½~Q´üR+&3„oÃ;š}í‚ah´ª¢¹ú¬jõş&ï}#\i«Ã=Ä‰í‘÷T’…µ}š(2´£;È{‚“ô¼È§:8Ş0é½ífò–i¡+_>ÍÈ>—¡æÆ-eë£–è §„íÁCR İÑ¦£„õùqC”N7ô+"á0Å—7t~JªğQp”uxsÊ¬+íôÜå×Æ;Kå™DÖ±§Ië^À»J@ÿ{1áÈiuO"úôfç½5A=€bÂêÂyB‰¹Ú¥Ğ¥óTêSÜmI EYï)ÀBUæ¾CèÓu¼QV·íÆ*B–y«ÀöoÅ[åIã#‘Ÿ5ìó-3¶‘õ¶ÖLæğYüµHaO¡3ÎJÁ šüÏBùQHÖNz¨ş¦zõ‰'"#%8Ã%yÃÏT%¥¿İ›ãäıÑ0É(¹ğŠ4ÄU”‡ŠŠVºokë/ë“ÿh]ËiVñ³ƒ—AÉä 84Ë|'“ƒÚnnÿajoÂYÁ¬K}Ş{* Ót·Ç¢Ä¤E}zN‡C©¾UJN½ü«(Ü"ÕÔ7°[/0„^leƒˆC1ÙNé”à¾nËŞí_×ÒoÜ+BöÁ œ²¤Y‹üÉ†¹…æ³˜'b)¨üï]zÌŸüÆø ’ê—BkLâOz†>q¨F|¢S|qÅG°ó“3&krC#©Ú~ƒ 'ØTÕ®ãB\ZkÍ­w1^¹ÜÏ;;Ÿ€NåŠáœ=¡‘"«Q©ÊîfŠR4
c*çz^ŠPŸ¦`·Õ±í§®cFøTœ¨lé/üsÀ\¯x3‹¸—,…>‹Ü5‹Ë×±)€6ZÿV¿Ğ#D˜s[fƒºN®˜ˆn~æ­WÍ$²üwaÈ° _mƒ;ÁÏ¯"‚÷3[¡=lÍb,mó´TÕĞißë3ŠÃD— êÄğé¸˜`q¹yd.{ÚšNj¿¥JWß|¤ÉQ_Ê0¡/âƒ]qaàî”å…/æ?mùj`Ä‡p-%]’X¨]ˆ| ÃN³~÷6ú˜Œí®i*€
óÔxØDÅ2·~Ãßèİä®8®Äe½û¢šGß£º–ÜGåÜC}Ùi„Ÿ‰	FÑÎ­İŞÔ$P¯{“A“)èí
6‰‡5ùN6T!G¼ö”eÄª_¶b¿PZØÏf©ó¢.÷ñ*ì…~Á>R3şƒ„ş)F+ÊC•g¡mX^~a‘öpAGè—}Ãİªù¬–nÚãpœäp1õÖd³ûhƒ{xİg"Ã`{C‘’2½îÂ_i2AšÂÁ›FpñÇîÆîßö5¡ˆç—IˆúxÏHw4qĞ-Ú¢-”£ìä2fTÁ,æ£shE¥o
=ÁGšçû”s~‹6 ç†
0mêt	[˜•oëP·ŠJ.¸±ã
û¡,­†u„ıçòd»dìy~ãIãÃiQf†b’†w‹ªÚRATªiØ@¯ş[ÄjG@ø¤9¤^Í÷1q”}©ëk\ëpÎû.¬(ø‚Ák¿k\A+ân˜ûéõA‘£ ş4{Œy«¸Ó
±„‰ü\~K±°ŸÃ> Xã&bÀwk;»"¦	p¹€„Ó³°£ÿ%d”oŠŞ8îæ¹¹–l¤êµ±Ü€ê–5ƒ¢”x›Ê|>_(1~ˆ!“ùXjQ´Õã1ƒmß[¾Ä#‘˜7	oŸ]Ô†ŸtÇZ‘lÃ‡¯v*…ôÍŒs˜!·ÈØø…YqWÄşûzêä¦”“¥|0r@ã­~u›Â ¶òXI¢@¿BüÕ±ïºÎ†ñº¹Û!,YıÈî”\iğ1OÂNxÂdG~İVÚ>p¢ÏƒfO2«Ë"É+²ÌÇı³]¯1Íßrİxä»)K¥7¶*`S™Óğjlú7«3C³+Òî€Í<}ªÂ$¼·{Y+uÏ gÓu}#Bğë«2¡B«ÕÁ²Æ÷ÑÓİ?	Ö‘Ÿ?¸"©‡zæÜ"{1®Q
îc¿sH„¸Yh+A+<˜Ò,³\f¾‡n¯’Èã˜‹ú7Œc>aÑæÂ9Ğzäè²ÿQ|ğëaŠãµlÅc!XmƒÈ*ä¡l×x|:Eˆ*ÇVó•Ô.ñ´Òãt&D.mŠâ®˜y¿#Œ—çéuì“áGÿ2Z‘T}mÀ0«¾¿Éª:œKw´ì;Ñ²HÑ³jM“İˆôi
à²²c¹?4íÔ¹V^¥îÉí*’ï<nQ2Rm¿õvá¤ˆ"ª!¶»Î÷.‘<¯T#%§hËåûËöP¢m ³¶’&	e–«İ1RXg8mYñ VSØ^ZAO?aÁİOMüùñ@ô‚LƒÁÚ®¡Ì"uÑB¨Ê®ÄĞtì[Á@è)|,uÿ=1!(µ«föÍ™]¥›d+«ˆ.º†xÏE6¦RÀ›HËna÷FfĞ®ùdÅµR¬À•*`b™Ğ*¦®ÎQÏ>/VeÉ™ ú b‹½ ï*Èbkêæı™ëVÓÈ‰“a^ '°qÇë¢ş€ÊİòµZÅÄÑ¼Hê¾ü<¿v)EÈ&İÆR¸Wİu·º§cZ%~."ñ³w0š:ùµ ’õ€;eİƒSà«N›íq÷  var $chip = $(e.target).closest('.chip');
        var clickedClose = $(e.target).is('.close');
        if ($chip.length) {
          var index = $chip.index();
          if (clickedClose) {
            // delete chip
            this.deleteChip(index);
            this.$input[0].focus();
          } else {
            // select chip
            this.selectChip(index);
          }

          // Default handle click to focus on input
        } else {
          this.$input[0].focus();
        }
      }

      /**
       * Handle Chips Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputFocus",


      /**
       * Handle Input Focus
       */
      value: function _handleInputFocus() {
        this.$el.addClass('focus');
      }

      /**
       * Handle Input Blur
       */

    }, {
      key: "_handleInputBlur",
      value: function _handleInputBlur() {
        this.$el.removeClass('focus');
      }

      /**
       * Handle Input Keydown
       * @param {Event} e
       */

    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        Chips._keydown = true;

        // enter
        if (e.keyCode === 13) {
          // Override enter if autocompleting.
          if (this.hasAutocomplete && this.autocomplete && this.autocomplete.isOpen) {
            return;
          }

          e.preventDefault();
          this.addChip({
            tag: this.$input[0].value
          });
          this.$input[0].value = '';

          // delete or left
        } else if ((e.keyCode === 8 || e.keyCode === 37) && this.$input[0].value === '' && this.chipsData.length) {
          e.preventDefault();
          this.selectChip(this.chipsData.length - 1);
        }
      }

      /**
       * Render Chip
       * @param {chip} chip
       * @return {Element}
       */

    }, {
      key: "_renderChip",
      value: function _renderChip(chip) {
        if (!chip.tag) {
          return;
        }

        var renderedChip = document.createElement('div');
        var closeIcon = document.createElement('i');
        renderedChip.classList.add('chip');
        renderedChip.textContent = chip.tag;
        renderedChip.setAttribute('tabindex', 0);
        $(closeIcon).addClass('material-icons close');
        closeIcon.textContent = 'close';

        // attach image if needed
        if (chip.image) {
          var img = document.createElement('img');
          img.setAttribute('src', chip.image);
          renderedChip.insertBefore(img, renderedChip.firstChild);
        }

        renderedChip.appendChild(closeIcon);
        return renderedChip;
      }

      /**
       * Render Chips
       */

    }, {
      key: "_renderChips",
      value: function _renderChips() {
        this.$chips.remove();
        for (var i = 0; i < this.chipsData.length; i++) {
          var chipEl = this._renderChip(this.chipsData[i]);
          this.$el.append(chipEl);
          this.$chips.add(chipEl);
        }

        // move input to end
        this.$el.append(this.$input[0]);
      }

      /**
       * Setup Autocomplete
       */

    }, {
      key: "_setupAutocomplete",
      value: function _setupAutocomplete() {
        var _this46 = this;

        this.options.autocompleteOptions.onAutocomplete = function (val) {
          _this46.addChip({
            tag: val
          });
          _this46.$input[0].value = '';
          _this46.$input[0].focus();
        };

        this.autocomplete = M.Autocomplete.init(this.$input[0], this.options.autocompleteOptions);
      }

      /**
       * Setup Input
       */

    }, {
      key: "_setupInput",
      value: function _setupInput() {
        this.$input = this.$el.find('input');
        if (!this.$input.length) {
          this.$input = $('<input></input>');
          this.$el.append(this.$input);
        }

        this.$input.addClass('input');
      }

      /**
       * Setup Label
       */

    }, {
      key: "_setupLabel",
      value: function _setupLabel() {
        this.$label = this.$el.find('label');
        if (this.$label.length) {
          this.$label.setAttribute('for', this.$input.attr('id'));
        }
      }

      /**
       * Set placeholder
       */

    }, {
      key: "_setPlaceholder",
      value: function _setPlaceholder() {
        if (this.chipsData !== undefined && !this.chipsData.length && this.options.placeholder) {
          $(this.$input).prop('placeholder', this.options.placeholder);
        } else if ((this.chipsData === undefined || !!this.chipsData.length) && this.options.secondaryPlaceholder) {
          $(this.$input).prop('placeholder', this.options.secondaryPlaceholder);
        }
      }

      /**
       * Check if chip is valid
       * @param {chip} chip
       */

    }, {
      key: "_isValid",
      value: function _isValid(chip) {
        if (chip.hasOwnProperty('tag') && chip.tag !== '') {
          var exists = false;
          for (var i = 0; i < this.chipsData.length; i++) {
            if (this.chipsData[i].tag === chip.tag) {
              exists = true;
              break;
            }
          }
          return !exists;
        }

        return false;
      }

      /**
       * Add chip
       * @param {chip} chip
       */

    }, {
      key: "addChip",
      value: function addChip(chip) {
        if (!this._isValid(chip) || this.chipsData.length >= this.options.limit) {
          return;
        }

        var renderedChip = this._renderChip(chip);
        this.$chips.add(renderedChip);
        this.chipsData.push(chip);
        $(this.$input).before(renderedChip);
        this._setPlaceholder();

        // fire chipAdd callback
        if (typeof this.options.onChipAdd === 'function') {
          this.options.onChipAdd.call(this, this.$el, renderedChip);
        }
      }

      /**
       * Delete chip
       * @param {Number} chip
       */

    }, {
      key: "deleteChip",
      value: function deleteChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this.$chips.eq(chipIndex).remove();
        this.$chips = this.$chips.filter(function (el) {
          return $(el).index() >= 0;
        });
        this.chipsData.splice(chipIndex, 1);
        this._setPlaceholder();

        // fire chipDelete callback
        if (typeof this.options.onChipDelete === 'function') {
          this.options.onChipDelete.call(this, this.$el, $chip[0]);
        }
      }

      /**
       * Select chip
       * @param {Number} chip
       */

    }, {
      key: "selectChip",
      value: function selectChip(chipIndex) {
        var $chip = this.$chips.eq(chipIndex);
        this._selectedChip = $chip;
        $chip[0].focus();

        // fire chipSelect callback
        if (typeof this.options.onChipSelect === 'function') {
          this.options.onChipSelect.call(this, this.$el, $chip[0]);
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Chips.__proto__ || Object.getPrototypeOf(Chips), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Chips;
      }
    }, {
      key: "_handleChipsKeydown",
      value: function _handleChipsKeydown(e) {
        Chips._keydown = true;

        var $chips = $(e.target).closest('.chips');
        var chipsKeydown = e.target && $chips.length;

        // Don't handle keydown inputs on input and textarea
        if ($(e.target).is('input, textarea') || !chipsKeydown) {
          return;
        }

        var currChips = $chips[0].M_Chips;

        // backspace and delete
        if (e.keyCode === 8 || e.keyCode === 46) {
          e.preventDefault();

          var selectIndex = currChips.chipsData.length;
          if (currChips._selectedChip) {
            var index = currChips._selectedChip.index();
            currChips.deleteChip(index);
            currChips._selectedChip = null;

            // Make sure selectIndex doesn't go negative
            selectIndex = Math.max(index - 1, 0);
          }

          if (currChips.chipsData.length) {
            currChips.selectChip(selectIndex);
          }

          // left arrow key
        } else if (e.keyCode === 37) {
          if (currChips._selectedChip) {
            var _selectIndex = currChips._selectedChip.index() - 1;
            if (_selectIndex < 0) {
              return;
            }
            currChips.selectChip(_selectIndex);
          }

          // right arrow key
        } else if (e.keyCode === 39) {
          if (currChips._selectedChip) {
            var _selectIndex2 = currChips._selectedChip.index() + 1;

            if (_selectIndex2 >= currChips.chipsData.length) {
              currChips.$input[0].focus();
            } else {
              currChips.selectChip(_selectIndex2);
            }
          }
        }
      }

      /**
       * Handle Chips Keyup
       * @param {Event} e
       */

    }, {
      key: "_handleChipsKeyup",
      value: function _handleChipsKeyup(e) {
        Chips._keydown = false;
      }

      /**
       * Handle Chips Blur
       * @param {Event} e
       */

    }, {
      key: "_handleChipsBlur",
      value: function _handleChipsBlur(e) {
        if (!Chips._keydown) {
          var $chips = $(e.target).closest('.chips');
          var currChips = $chips[0].M_Chips;

          currChips._selectedChip = null;
        }
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Chips;
  }(Component);

  /**
   * @static
   * @memberof Chips
   */


  Chips._keydown = false;

  M.Chips = Chips;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Chips, 'chips', 'M_Chips');
  }

  $(document).ready(function () {
    // Handle removal of static chips.
    $(document.body).on('click', '.chip .close', function () {
      var $chips = $(this).closest('.chips');
      if ($chips.length && $chips[0].M_Chips) {
        return;
      }
      $(this).closest('.chip').remove();
    });
  });
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    top: 0,
    bottom: Infinity,
    offset: 0,
    onPositionChange: null
  };

  /**
   * @class
   *
   */

  var Pushpin = function (_Component13) {
    _inherits(Pushpin, _Component13);

    /**
     * Construct Pushpin instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Pushpin(el, options) {
      _classCallCheck(this, Pushpin);

      var _this47 = _possibleConstructorReturn(this, (Pushpin.__proto__ || Object.getPrototypeOf(Pushpin)).call(this, Pushpin, el, options));

      _this47.el.M_Pushpin = _this47;

      /**
       * Options for the modal
       * @member Pushpin#options
       */
      _this47.options = $.extend({}, Pushpin.defaults, options);

      _this47.originalOffset = _this47.el.offsetTop;
      Pushpin._pushpins.push(_this47);
      _this47._setupEventHandlers();
      _this47._updatePosition();
      return _this47;
    }

    _createClass(Pushpin, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this.el.style.top = null;
        this._removePinClasses();
        this._removeEventHandlers();

        // Remove pushpin Inst
        var index = Pushpin._pushpins.indexOf(this);
        Pushpin._pushpins.splice(index, 1);
      }
    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        document.addEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        document.removeEventListener('scroll', Pushpin._updateElements);
      }
    }, {
      key: "_updatePosition",
      value: function _updatePosition() {
        var scrolled = M.getDocumentScrollTop() + this.options.offset;

        if (this.options.top <= scrolled && this.options.bottom >= scrolled && !this.el.classList.contains('pinned')) {
          this._removePinClasses();
          this.el.style.top = this.options.offset + "px";
          this.el.classõ@àû`B­
¦6¥§±¦ié`Üv¬Î)ÔGÀ â–,¬ä{®ìãÒ¸"çÕ£÷mú‹aÁÑ®WØ5`­ÿıOÀ®$óòÃˆı*Ø*_Áâ’¦Oe…3º©¡|^Ş·´_“Ôéyî¿¼_«C¨ˆ&F“‘p®O]ád’Çf"Á,£R»³`†ÒÏì‰ß³Ày’Û5Û8²¡]UMƒÅ7á±Í…ç$Ad~ˆÙÑp4P£¸“JµÎnÃ¹fğ8¤éã8Ë÷àQİ³'NÛ T‡à™çQ–Ît†LôÌ-YM”o¥¥Øï!õÜGDï7<)pHp9 0gÊ;»Å XB@ÁŞã–¥S#&ß7Éû3­€{-}Ğ€Ğ;Uro¼&âãm#ùp°êÁÈÒP…°#²è=¿œŞ{Â}MM°gØó2ÆŠ,ãıLŒy®ü3i½ÓğLùS		BÆ †¹Šìš0´JşËªü’Ìôãµ¥A7-N)5!,\²V&âÓ­"ïÆŠ„>&_C%ˆu
ˆ·ö¬Ïxš3&®ˆwÒ}‡p°…×R(£V16¯uË»UóRŠ±ÿ".ø‡o¼’ÑÛsis ¹Œ1 Ñ' ~©Èò¾ˆ€ifï8AkóeK¿êM­Ø$ØñZêÛ‚Aîí6€úQ³aï¬æL¶&á>2+”E`¾‡¦ê/…ÿ„½;¡¸R„CGg2ó¤½pÉ.ãíFñK™Pù°°kŠñ+Ë¾¦E9 ¶Ts:Z¦‹<‚Şö]ëÕäÈ´3à½ú\}ÿN­ÿUúë©—úáìx¦)3Ãë÷á_ö7'Z£ÆÀ1–Ú ¼#¨„ş$Dïœ—8D¹ØEHï‚Ëòòº¼1'á;íƒ¦…È9¹/£* ~«T	”9&v×G”6b`I-›¬_CÕJ!a\%-MUšSºTäkPİ*¸ÛìÀÙfù¾»ö›>œ<+øÙkš¿0ÆXÈ¶8:ŒœÁiy@ı?œBı^²!x[ÿtG#ù¨¹.^¶Zë{\áWì%Ë´õGâ´]ª„Q7Aÿcº}>Zì:´ÖÅ» {Ì&¦CoÙÜ1‚@Åœ¼3‹¾µè4Kj…Í‘!OtëVóä—<2ÏA\]ƒssé@óQÀõróÁİ{G¿î5š¥Ÿ–¯ø#Aâ¬%hnIøÒS”Ú]šn‰ x—EUšTşaù£†}ˆìÎQ={àuı…pÙ«§
›HøtZŞ>dõ»~üß9Ú6‹ÇäR‰4›ûˆ_¢›Kˆ	x#À9v”!üööŞˆl«¤Në¢*ıª‹¾¨"êZ€íßN¢|I^a ,Tú²,;Šd×ûj
Ëÿ&ß/1YíÜ“‹ d{ÚÏwügÆJÆd´'Î |.ØÖEGòCèúÌÉó ÒÙíyşÄ‰÷soR¿*Ë,•“yŠñµ|Y_†¦wiYoäÆöIçOß(øF
Â‘àŠ;µÊ©±î"ß˜ú|G$Š§|“z§ –AĞdªy<Ø¬…˜ìã6i³'a7l6ßx!:è‰“OæC„Ÿ!úåÒb›%8Åo:í0rya¦¾‡.Åsè#T´¡C#R”ÌY™;)Ò5pÒ[Êw<qïr<Iûc0—‘ª©¸ï2Æ1X´ú¢í³]™5KáÕTÍåuÈ!W,†ín¿=êK“ Ô75z­/°¡³ATxwIJ ˜Í$È½xqaz xæ3şøR®ù6ñÜœ-Î™.ö˜VæÂÌÁ—;V{°ëCp|¿km3²İõ=’r‚úf­<P¼&êêğÖZÀ5
zàäA5õNñTÀw!læAâ`::™NÏ¡‰F]*¯pÃù”TlÒN®-Ó‚€ÉS9	q¥ø:ÜÍß•¼¢Í.Òœx! KcÉó®‹ªˆü3$¾XíÊ–âFêitT±î-cÿ* …KM¯¼L</5ÒÙ4¦ky~ÙÇÀeßèu`¬†“I7låŠ0ãq	‡YÀÑ¤gïÔøå*ÛŠZ—¯¬©…\°Ğ>ä.gÖaì`Á7W_å¿¨ºô‘ßzğ
#·¹>‰W!‡tì#	A.•æ’£ITó$Ö¼3­|ƒö²6}’Í—'[Ú_8ö¤p‡ø¬üp¾ÉŞw¬ÎùUQ ©Ózşš=äwnïKƒÅóøÒ˜‹Û¦zšpùPC1[ÙoSŒpg¹MÄ(º¦§äzST5™ÚµÕíg~'« zŠ$‡8
zï Îes+~^°ï¥m",LÂ.›œ¥¿¦úÅP‰>ñ^…"'+Uº™ìô>*‰mJF¥ÍO'µWì”) Q²#ÊRË‚d°y[ÆşïQİa‹²––kNh´5šÑ¨³}¬fÕeªëiSV5§Œ‚¬½BöøoXBüº:±NÌ-ğjğM‡'L¢–#ÛDsİÜóTb~¯îD–É]Bh¸™ĞÏa†ˆ”ƒl±æòè„–”ä“ª6m8…oEsÁIpEC®·ö9d´—î	˜Àºx[ñá^ßóßn©ÈŸĞ™Š³%TtÆz½C¼]Yû@ÜöLs²¨4³JÚJÄ©ú“ÀÒ	BÀ¤Í†ãtÈÜ±âuáûŞY¦ûàı…¼8y’3ˆ—6vµ&Š@£›ú\c=*àÀoÀÆlÂïÜìmØTHerŞ5cñv…SüA@ÄÎÅÆ™}|[Cm	S<îQ‹Ë<	 dÙ‘U§µÕ?Wu??ÁgQ:ÓÄÚM®@™ì%í–³ÈúCÑ6¨÷¦ XiF™Ö :‘Æ‚$Â\5ìï¥k$WŒœæÅª&óPEZ$;x´RÆZæ€œ¡‘cø1Ç„ì5eéK¢Í®hL0x'âËî`ĞÜ\yäZÀl7ÙÓÎ!Éû@FxéÏCÇ-d0Ú·•#ñc¹ z~I0Şİ:öƒÎ/Ÿ•7AO 9íà‰MƒOX_tæúğMmİVCõ†8F¾"†j¬62É›ëÂ7ˆÔÛ‹O‡´æ_ºîÊJ‰÷“Ë–ì¨ñªÚ´m?(—¼NŠ… ¯Œ¢›¶3±æŞ¬ŠöÜğ¬š§4ÓôÓRĞ3 –R H­.í£åÆ‡}BªáU5/#Jß›ëè²ñ"dè€Ï·³o/µĞ×Å!tïKØIì™­§\£bßàŞ«z¢Š‹ÑÑt)××ß±•ŒQ@}Êúu…çKñêÆÿr+©RMXtJíC¶vAÃNŠ	—xx†™TÈâä±/}Ùù:"1hÛ>-Úï!â¨œTI?}©+ö¹Ò¼3¤ +Òã#)ñnÑ_íJ¨œ$ÏŞ[C˜fàšCºwˆœ¤2f‹k	ş¼uË[Aº:r®Ÿì.ÜHÙª¸?eÈùÑ´œòô¿!)}á}G­´EQ’tç¯àÔù\1£r…áPíSòºû¶°d‹MH Å†î_QàøÎAÂÏÊ–cV«&ã«÷zËWç«èJdè‰-QÀ¥C'K]½Ğ—Ç7`“ŞEÓ°—5gCHpà”ËÇ/’ëV=óıë’N2¡I;Áõ²÷Ğğ#"1.øt!ı®á†çÇ(¬¡‡Ná[[P¥Ìt©¡ D3-FtíÀ©¨µ°”{~0@l)–éÛ/Ü‡æSŞAì4Š°ıÜfÆ\2'<¼ÌñVÈ‚RFÅÙK˜ÎÂäaÛX )èÔxäK	Vğ“ı]gİB3¡lírÀtÊøÊª˜CÛ#Ğy|pMwuB€C¢QaõË‡…:`£Î»ê¦‰šs…ãB˜Ù%Ú\·ÁËß|Èâ::3åÕÊhø„.K·1D+ë¶)ÚtÔL4A­:|»²
\~öù»!&>MåáL&åÑ#}‘­ü “çTÜ)MÂ]âÇå/¡üDíJ¹Ô)pç¬Q`§2÷¦	Åâ62¸äßÊs’¤Àğ»‹r*ÏQy7ë%³¬¡Š%o+ÁŞÍS‰j€ŸÿF.OvàÕ.ø?¦|yY–ª¿Ï½û
Ç#›åöd%	ó<!ƒ&uŒäk›)J¢Lõä8¹®œ ²Ô€5üıˆò±c’4²’‘áÊÚ³Pç®ÂF)Ö²¿•ì³ï¼<8ÓhKrWÙ&	7ke_°a­9¯µi¹ş{ Çş^ )6µlsO>Py—Yò#Ÿ6UÕJ„ØirñÎ“Ö}oõ8»]Ápªf4çw¢½ïÚ'›}‡ı‰2b–×æà…*•öDèO±Ïë\«Û¹dú)K,Æó`™tèHTşB@KÄÁ[û®¿/+êÂr5ª·\´¸°÷Ä1è¶$nã¨¢	Ñúdšz$`ê‘7õñÊ›†pYl]ˆCüé¼'UZ)ÂÇ±+srÄÉQò—Öëhş²û•:i Õ@†[zĞ›¤Nâk’vÍj‡ş+ÙJ²–°A”Ôl¹ÓòeÇMCsüáõ¹©ú	Ğ½fÍŸğ¹\Æv?†Ş|ˆD–ll»¥DÖõ=Néä«&FúŠ6ËBjÎ¿,³ıT¦Oöàf¦Âøz	3wu¶€m³QëtåÍt0…iìÿ~UgV1–¯ ]pTí~´©)V–ı°¼
xïËõ³ T‡‰²w³ç·(‰ÆÉïvìÈP÷¸i7¾Wš´!ĞcCª#‘>^/	"ºªohØÑ[ß{dZÍl*‘«G!¹ÊU·¬Šê´Mp4$ÓRMS%ïwúLğ¬ì£8>wà}F§rÇÆûZ=L\„F>#>ädë°×ŒdRÂ=KDc§Psî¶cÅ)hÄ~ø»Èauúøü  ï¡Ï‘HW‰x	_/¬“ÅuoØ€ˆÛ°XÛ[H¤,›´»D³ü²Akñ/Ñ÷–¸=ôÅO™«CÄ¥qĞ\î¤/m»åóìş‘)Øƒ
Û+	¸³³ËxBìw®×ZEkRdàö	,2¹ç1c/·k™"ÿ&‰+úğèøP2(á:{_YOš4là&C	€MgŸà—Uíš¬j$…½éÌÿHŞ'öŞcRÜ­Âöå9CéfÈD
jônÍ"ÓB2şì[Ê¾­1%Òû )¢\?	{†(»‡È‘_{»o`#rËŞàş ÛL>5m€ş+K”ûDt63a.$%¹¡öóèßxvĞˆeîTö7ùnôh"Ù×^y`‹Gªğj€q°K›"€ 8›m`ÉKÅÕ ùèSÈ ğiions.direction === 'top') {
        _this48.offsetY = 40;
      } else if (_this48.options.direction === 'right') {
        _this48.offsetX = -40;
      } else if (_this48.options.direction === 'bottom') {
        _this48.offsetY = -40;
      } else {
        _this48.offsetX = 40;
      }
      _this48._setupEventHandlers();
      return _this48;
    }

    _createClass(FloatingActionButton, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_FloatingActionButton = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleFABClickBound = this._handleFABClick.bind(this);
        this._handleOpenBound = this.open.bind(this);
        this._handleCloseBound = this.close.bind(this);

        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.addEventListener('mouseenter', this._handleOpenBound);
          this.el.addEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.addEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        if (this.options.hoverEnabled && !this.options.toolbarEnabled) {
          this.el.removeEventListener('mouseenter', this._handleOpenBound);
          this.el.removeEventListener('mouseleave', this._handleCloseBound);
        } else {
          this.el.removeEventListener('click', this._handleFABClickBound);
        }
      }

      /**
       * Handle FAB Click
       */

    }, {
      key: "_handleFABClick",
      value: function _handleFABClick() {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      }

      /**
       * Handle Document Click
       * @param {Event} e
       */

    }, {
      key: "_handleDocumentClick",
      value: function _handleDocumentClick(e) {
        if (!$(e.target).closest(this.$menu).length) {
          this.close();
        }
      }

      /**
       * Open FAB
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          this._animateInToolbar();
        } else {
          this._animateInFAB();
        }
        this.isOpen = true;
      }

      /**
       * Close FAB
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        if (this.options.toolbarEnabled) {
          window.removeEventListener('scroll', this._handleCloseBound, true);
          document.body.removeEventListener('click', this._handleDocumentClickBound, true);
          this._animateOutToolbar();
        } else {
          this._animateOutFAB();
        }
        this.isOpen = false;
      }

      /**
       * Classic FAB Menu open
       */

    }, {
      key: "_animateInFAB",
      value: function _animateInFAB() {
        var _this49 = this;

        this.$el.addClass('active');

        var time = 0;
        this.$floatingBtnsReverse.each(function (el) {
          anim({
            targets: el,
            opacity: 1,
            scale: [0.4, 1],
            translateY: [_this49.offsetY, 0],
            translateX: [_this49.offsetX, 0],
            duration: 275,
            delay: time,
            easing: 'easeInOutQuad'
          });
          time += 40;
        });
      }

      /**
       * Classic FAB Menu close
       */

    }, {
      key: "_animateOutFAB",
      value: function _animateOutFAB() {
        var _this50 = this;

        this.$floatingBtnsReverse.each(function (el) {
          anim.remove(el);
          anim({
            targets: el,
            opacity: 0,
            scale: 0.4,
            translateY: _this50.offsetY,
            translateX: _this50.offsetX,
            duration: 175,
            easing: 'easeOutQuad',
            complete: function () {
              _this50.$el.removeClass('active');
            }
          });
        });
      }

      /**
       * Toolbar transition Menu open
       */

    }, {
      key: "_animateInToolbar",
      value: function _animateInToolbar() {
        var _this51 = this;

        var scaleFactor = void 0;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var btnRect = this.el.getBoundingClientRect();
        var backdrop = $('<div class="fab-backdrop"></div>');
        var fabColor = this.$anchor.css('background-color');
        this.$anchor.append(backdrop);

        this.offsetX = btnRect.left - windowWidth / 2 + btnRect.width / 2;
        this.offsetY = windowHeight - btnRect.bottom;
        scaleFactor = windowWidth / backdrop[0].clientWidth;
        this.btnBottom = btnRect.bottom;
        this.btnLeft = btnRect.left;
        this.btnWidth = btnRect.width;

        // Set initial state
        this.$el.addClass('active');
        this.$el.css({
          'text-align': 'center',
          width: '100%',
          bottom: 0,
          left: 0,
          transform: 'translateX(' + this.offsetX + 'px)',
          transition: 'none'
        });
        this.$anchor.css({
          transform: 'translateY(' + -this.offsetY + 'px)',
          transition: 'none'
        });
        backdrop.css({
          'background-color': fabColor
        });

        setTimeout(function () {
          _this51.$el.css({
            transform: '',
            transition: 'transform .2s cubic-bezier(0.550, 0.085, 0.680, 0.530), background-color 0s linear .2s'
          });
          _this51.$anchor.css({
            overflow: 'visible',
            transform: '',
            transition: 'transform .2s'
          });

          setTimeout(function () {
            _this51.$el.css({
              overflow: 'hidden',
              'background-color': fabColor
            });
            backdrop.css({
              transform: 'scale(' + scaleFactor + ')',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
            _this51.$menu.children('li').children('a').css({
              opacity: 1
            });

            // Scroll to close.
            _this51._handleDocumentClickBound = _this51._handleDocumentClick.bind(_this51);
            window.addEventListener('scroll', _this51._handleCloseBound, true);
            document.body.addEventListener('click', _this51._handleDocumentClickBound, true);
          }, 100);
        }, 0);
      }

      /**
       * Toolbar transition Menu close
       */

    }, {
      key: "_animateOutToolbar",
      value: function _animateOutToolbar() {
        var _this52 = this;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var backdrop = this.$el.find('.fab-backdrop');
        var fabColor = this.$anchor.css('background-color');

        this.offsetX = this.btnLeft - windowWidth / 2 + this.btnWidth / 2;
        this.offsetY = windowHeight - this.btnBottom;

        // Hide backdrop
        this.$el.removeClass('active');
        this.$el.css({
          'background-color': 'transparent',
          transition: 'none'
        });
        this.$anchor.css({
          transition: 'none'
        });
        backdrop.css({
          transform: 'scale(0)',
          'background-color': fabColor
        });
        this.$menu.children('li').children('a').css({
          opacity: ''
        });

        setTimeout(function () {
          backdrop.remove();

          // Set initial state.
          _this52.$el.css({
            'text-align': '',
            width: '',
            bottom: '',
            left: '',
            overflow: '',
            'background-color': '',
            transform: 'translate3d(' + -_this52.offsetX + 'px,0,0)'
          });
          _this52.$anchor.css({
            overflow: '',
            transform: 'translate3d(0,' + _this52.offsetY + 'px,0)'
          });

          setTimeout(function () {
            _this52.$el.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s'
            });
            _this52.$anchor.css({
              transform: 'translate3d(0,0,0)',
              transition: 'transform .2s cubic-bezier(0.550, 0.055, 0.675, 0.190)'
            });
          }, 20);
        }, 200);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FloatingActionButton.__proto__ || Object.getPrototypeOf(FloatingActionButton), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FloatingActionButton;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FloatingActionButton;
  }(Component);

  M.FloatingActionButton = FloatingActionButton;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FloatingActionButton, 'floatingActionButton', 'M_FloatingActionButton');
  }
})(cash, M.anime);
;(function ($) {
  'use strict';

  var _defaults = {
    // Close when date is selected
    autoClose: false,

    // the default output format for the input field value
    format: 'mmm dd, yyyy',

    // Used to create date object from current input string
    parse: null,

    // The initial date to view when first opened
    defaultDate: null,

    // Make the `defaultDate` the initial selected value
    setDefaultDate: false,

    disableWeekends: false,

    disableDayFn: null,

    // First day of week (0: Sunday, 1: Monday etc)
    firstDay: 0,

    // The earliest date that can be selected
    minDate: null,
    // Thelatest date that can be selected
    maxDate: null,

    // Number of years either side, or array of upper/lower range
    yearRange: 10,

    // used internally (don't config outside)
    minYear: 0,
    maxYear: 9999,
    minMonth: undefined,
    maxMonth: undefined,

    startRange: null,
    endRange: null,

    isRTL: false,

    // Render the month after year in the calendar title
    showMonthAfterYear: false,

    // Render days of the calendar grid that fall in the next or previous month
    showDaysInNextAndPreviousMonths: false,

    // Specify a DOM element to render the calendar in
    container: null,

    // Show clear button
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok',
      previousMonth: 'â€¹',
      nextMonth: 'â€º',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    },

    // events array
    events: [],

    // callback function
    onSelect: null,
    onOpen: null,
    onClose: null,
    onDraw: null
  };

  /**
   * @class
   *
   */

  var Datepicker = function (_Component15) {
    _inherits(Datepicker, _Component15);

    /**
     * Construct Datepicker instance and set up overlay
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Datepicker(el, options) {
      _classCallCheck(this, Datepicker);

      var _this53 = _possibleConstructorReturn(this, (Datepicker.__proto__ || Object.getPrototypeOf(Datepicker)).call(this, Datepicker, el, options));

      _this53.el.M_Datepicker = _this53;

      _this53.options = $.extend({}, Datepicker.defaults, options);

      // make sure i18n defaults are not lost when only few i18n option properties are passed
      if (!!options && options.hasOwnProperty('i18n') && typeof options.i18n === 'object') {
         colr                    jp2cÿOÿQ )       Ï                       ÿR      ÿ\ #B@ H H P H H P H H P H H P H H P ÿ 
     M ÿ“ßqàPvˆóe­NËÜ±1UĞA]ÎBEç<î2¦ñcæIõK}“Ëã]şéU Ñh^eÙ–kcw1ÿ 
    P ÿ“ßqøsÛûYi/%eY æâ±ßHy´7K‘Å’å´…¯:HhÓ'°Ê;å¬³'Sİ=É¼÷yïÛ!B£êˆï.ÿ 
    > ÿ“ßh%mÏ§hóñ”¨2µŒ‹ù0Yğ¬/i
à÷[LÕÎµ–I(¿®UÓõBCÿ 
    L ÿ“ßqØñ·¤‘{/~„Ë½®„è£œ«ù/îÕ‹)_HîõQ$¹M¯tuŞB[‚¶q÷a»ÿ 
    O ÿ“ßqğ $øj±®-ƒ­Ó!DY[óPŒş÷«$’Ó2$©’ÛR;¯õ3°ÖâE 99à‡VùÁÒãLÇ5M*–ºéáÿ 
    . ÿ“ß€è ­†“ÿQb]ö åîµu'a÷;¬ıo‘tÿ 
    - ÿ“ß€àPNPw´İ^ª¥Ü²,y-ª—Wú{ƒ¿Bxò­ÿ 
    I ÿ“ßqÀÅOôÖÑ®íıÙcE)nªùLİ”ÒÎ“Æ•Íq²5LbŒ·›SZ+Êÿ 
    4 ÿ“ßqPS] Öæ¦œóÉ¶Â™9ù%Ò³Ú¸÷ˆK0îŠÏ*ÿ 
 	    ÿ“ß€(PT¯¢ÿ 
 
   F ÿ“ßq¨O…?ƒG0…’ãI1•{Ÿ7\#=iUgnÿëşKd`x»È0~áŞ3k¹aê÷ëIå{`ÿ 
    E ÿ“ßq G7~X =TcQ”PtK‚û³ÜWQT*W´¸T·5N@Ù:>ì/v'Šú¯èªä”IIõ?}ÿ 
     ‚ÿ“ÇÌ†>t±ó¦Mƒ¤kõC[¿Ó8÷ÑaĞ¦E+¶L¾@2’,¾öL¯.…	åw)Ñáå¤¹äZÁğYµş	ì–¾z¿˜ÔwµR6µ¤ºÿ>)ó4¹îpB`Ešóãd„îÎÛÂÎ„YSf[Ô>Ix‘Ô_ÿ 
    ­ÿ“ßqœúÍ£è\8ã¡ƒşÆäıcşİ¨lì®İµ™¡L(ü-¯_.NH%ÌÊw(¸BCÿ-ÉæIGR+øo$}É‘ä’N@å›¾öˆ‰ŸAwç¬''·P*u’è Ê]M7ï‡ GÆÆ‚7AxM©Rü¾Ú®éQ–àÌElC1Q<îFªw³Y;\òXr\9¸–±Ëû3‚ÒÔÿ 
    >ÿ“ÇÎB Ø>€Z/w#3LWÔ_»Uf‚j<Û@¿y9Íàá(ùªæ*9Ò·œ&ÿ 
    ‚ÿ“ÇÎ¢"ùÑ€ræY.¶	ği±£aaíUé9œÜË±Ä¸pXÅESèFBÜ‰DÙúÁ|šÚÏ»ßATlVeàƒaÀÿ7$ä•¯B®Ÿ¿µ]ŞZ§K}ÖÙKŸuwì%œ“fJPnÔÒ:ÄqÈÿ 
    –ÿ“Ï¨¶>uù (¶Å[=û=ÁÇ+æÏ—_ü†Ó&LT¬]ËLÈÍ¢×±zéRA:6äo¼Ê©kŒÙBÅ•a´$ŸÌØhÉ‘‰°³•„Å§7(÷°F€C.ÿ?¨ºNêK´"=±u=Ï› )ÎÔ˜í•;µË2:–o l¼ß¼ÿ+ÿ 
    *ÿ“Ãä„h>€5ì‡'XÏ*¥w	÷ovè
*ÿ 
    +ÿ“Áğ“…ÑÀ1œ 4ë\±Ô6Wœù1¯_’ÿ1ÿ 
    fÿ“Ãä79¸ùÌ€š‹ª¸ÂÓjeÕŸ“S`´Uë€‚Ì×?Ìi$³’N„ş×ÜŸÜı”€&Q1_èçU@W_( qšqÎüÅ:Ëİ4öÓö¾¯¯ÿ 
    6ÿ“Áğ|	@C§şÃyBA0‡ÛÛ²Ô²kŒ}= 4-½Œ…nê¾ÿ 
 	   ÿ“€ÿ 
 
   dÿ“ÇÎr>ƒ‘ò–&X¥±ä‚]-S¡<u½i/¥ª{9¸+j%‡\%å;]2S©±ç}J?àúÙßó9-Ùí*Lj*/Á›îƒaÊvî½‘hÿ 
    ÿ“Ï¬’}D°ùO€9H@£i<gÅğcOnËÑ6tæ°‘Ä¦ı»8¯´­7û¬ÍI‰â‹êİ1Îù
ª_	á—8/)”¼¹ ü×ZÀ·Z?tßêNM»|$c<4®İ~|W¬øé±RèwÑ^Î%¨¶qĞÙÿ 
    Bÿ“Ïš·>zÌù®à¡	ÌÿIAYƒ)œÍ*ñÄŠßd>Ú«ô„Xz›ö…?W“DÄ2“ ñ+Åõ¦ğÇª´ë}#ã8’£µÇ)GëXefñ'Ub¾x&’™ù÷§5•=Š±r'÷Š`øoaŠF‹||á»»ÄèsİHÎ ²£óˆIfP
ƒŞşJÀğ³Ø¼¬ëÄ¹ØíÎUÓ½Xkàu@mÊ&‹,>¼¯—ºIÑDİg;ĞÃèˆŒN„	ğÎ»øP¢¨•ƒi8sıJÇa†@½KñC×“…ä²MN€m;„ıXbğÅPÊ:ÔyÔ‡=…ñ3ÀûqÇb;R>ÉE)X¿.]Óy «Â÷àâyİ÷Üª0!;¢¢xTÕ—aVîv—ÿ 
   ±ÿ“Ïù>;.ªV)Ië7gÖ]$İ“éñ+ÕT‡ğákšÅ2*#à,ñGz¥å™]Xİw£àeÇí°ß½TkÅÕã¥­RG½f©>%ûº­è‹V{´oóè2ˆ=}È…öŞŒU€®ëŞaê^]¥ÀòÛĞ2DU ıÉOR¯EJŒ±Ô^¿	âqîZcœ: ™LàLpÆì+C¨ÛÁzHİïı2º°¼9³äØéú<Zl›³£ì:æ€‚¹3>öF$Ë@şÏ”ü ~Vz àĞjÆv ;;Í‘I@ÚfÚ”ß‹Ä¨s¿Å%Ø§»oZfŞ)„Ïw•aÖ®ÇZkPÎñï(à4èâÔfãÏ¤Ósú¦~ªòõrOˆ­Ôõï°Å¯àW;ö;D.¾k€IÁû]óKeHÂøù–r¿†9ùI.;§«'¬Ÿ5ï»/kˆIÕ„­JMí~‡Ägl'Ä¬©Á}öZá¶îäZv½wÃC+uôG†Tß»ˆ¨pwÑIfî÷iİmå­-—êI‘¹S²«>•’ÿ 
    Rÿ“Ï˜¼|…ağ .Cv¹ø’àŠ}½=€¾šı@Ş€¿•oõaä´ D`7I¯ÈÛ /Êğô1Kçëó|ÈR‚ÿ 
   ÿ“ÏÇ>zT|”°"şÛ–şlâÑ¡¬Z°ûXlYŒÏ#Ûxtğİ4z2Ïˆ5¬$÷K%addœ¢/!'(tP&½äS¦v¢"æF3¿ˆ—q*Ô[s_vïQªØ2óµ‚n²wú8”šQÌ¼L©;WÏ¼îÏ—ó—V¢+ %L]wƒ’Ó¤W)ßêØLiH¾`Æ ^V?´Z¤†‰’né
P%LÄÊO#;0ùË/
vğßşÂÂH¸Rg¨§øWŞ×É†í¿â#¿Æ3ëN]ë¢Ÿ1ëJ3lF--¤+ù²Z'ĞB$ı2[y'¡¼íJí4 Â¯ÙHXå1 ™ìÿ 
   >ÿ“ÇÉfË%pRÖ
±§‚!Q$tõ¨ÖdŞöĞkÖÊòíÏ‰¶LéÉlÿİ|"áœÛ»Ÿº ë)W¶¯ízŞˆÖ©ö6Bê¼²oÁÑfIP~g€®hQPqÿA»Ìı4.¬B@ô'¶$n“: €Ó=M}`û ?vÒ¶›ì:3ZX²$ğÓchğÛvÉëŸ?Í¿ïp(Z>{.µ1ÄG½ÄØ½ÆóŞ‘8úîò¿!§g¸\É½vFô‰Æ$]­ú9çvBù‚;½Ùû:âÚı$Röîp3<s"£njãFy«HÀøyB§'µÿXÕOÓ'B&º7ûÀZJí´÷şMÀ[¡ÜëZí6Ãª3Ñ,G»4cV‰ŸÓEÜ¥ZF\¥HÙ‰ÿ 
    .ÿ“Ãá">!øH
‘AXïµ‰8qÓ2šñCÏZ"kò(ÿ 
    2ÿ“ÃÄÃ¤Cà0‹r•2UÈÁXûUx9De«İ8PnÿCåù[xßüõÿ 
    ³ÿ“ÇÈÎ>F±ñµœÅoql™ï€@³2`÷—;úøO¤IşºìIøe®e)aB¹Rú©=''lÇ«¹Ät”•ZÓùc×5ü’"©±^Ë­5)
ö$Åo/F§–,zìåTjõÂZ8úˆ ïÆ@'=¾Ã[Ø“h¨U2ª†	ˆ¼Ô˜géÍî.Ni‰WìúIÑ>ibÈİ-¤aÎdrÚ/0}·õúvë9Qÿ 
    Sÿ“ÇÈ:>CĞøªvB-r¨êJpWgDsŸµôÆ`›%¿ğhóeGJ[QQgõ0÷y74r8÷½ÿp(9Ïêø!N¦ø¦ñÿ 
 	   ÿ“€ÿ 
 
   Ôÿ“ÇÆî}Ùó¶B–:¯ˆ–/À‹Ãµz#¬ô½+‚q#q§ûç¢Å@óÙÊ±JXòzYºµ›'›´¹×C~ğë&„ñ:«›„<á?=^
: f¯Ôb†™á¯âÌ©(Œ¥ RLÓ(¥ÌTA^Ğòd†ÉéhO)È/»8¡aÖŠ‡Í©ÁW°VuÙ~4w¹r±½7–úF–şû™ÒsŠJÈtJ<şP	†7¶C]®âÇz£©ÁVRwa›Fj? Ğ38ÆŠın‚—”P©óÿ 
   ÿ“ÇÉDŸ=ª|ôÀ+ã«(”ó™ß*ŒêrQ0³,¢z½.%0É5”$SH½j&E(uÈîûüã\ÁStypeof this.options.onSelect === 'function') {
          this.options.onSelect.call(this, this.date);
        }
      }
    }, {
      key: "setInputValue",
      value: function setInputValue() {
        this.el.value = this.toString();
        this.$el.trigger('change', { firedBy: this });
      }
    }, {
      key: "_renderDateDisplay",
      value: function _renderDateDisplay() {
        var displayDate = Datepicker._isDate(this.date) ? this.date : new Date();
        var i18n = this.options.i18n;
        var day = i18n.weekdaysShort[displayDate.getDay()];
        var month = i18n.monthsShort[displayDate.getMonth()];
        var date = displayDate.getDate();
        this.yearTextEl.innerHTML = displayDate.getFullYear();
        this.dateTextEl.innerHTML = day + ", " + month + " " + date;
      }

      /**
       * change view to a specific date
       */

    }, {
      key: "gotoDate",
      value: function gotoDate(date) {
        var newCalendar = true;

        if (!Datepicker._isDate(date)) {
          return;
        }

        if (this.calendars) {
          var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
              lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
              visibleDate = date.getTime();
          // get the end of the month
          lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
          lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
          newCalendar = visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate;
        }

        if (newCalendar) {
          this.calendars = [{
            month: date.getMonth(),
            year: date.getFullYear()
          }];
        }

        this.adjustCalendars();
      }
    }, {
      key: "adjustCalendars",
      value: function adjustCalendars() {
        this.calendars[0] = this.adjustCalendar(this.calendars[0]);
        this.draw();
      }
    }, {
      key: "adjustCalendar",
      value: function adjustCalendar(calendar) {
        if (calendar.month < 0) {
          calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
          calendar.month += 12;
        }
        if (calendar.month > 11) {
          calendar.year += Math.floor(Math.abs(calendar.month) / 12);
          calendar.month -= 12;
        }
        return calendar;
      }
    }, {
      key: "nextMonth",
      value: function nextMonth() {
        this.calendars[0].month++;
        this.adjustCalendars();
      }
    }, {
      key: "prevMonth",
      value: function prevMonth() {
        this.calendars[0].month--;
        this.adjustCalendars();
      }
    }, {
      key: "render",
      value: function render(year, month, randId) {
        var opts = this.options,
            now = new Date(),
            days = Datepicker._getDaysInMonth(year, month),
            before = new Date(year, month, 1).getDay(),
            data = [],
            row = [];
        Datepicker._setToStartOfDay(now);
        if (opts.firstDay > 0) {
          before -= opts.firstDay;
          if (before < 0) {
            before += 7;
          }
        }
        var previousMonth = month === 0 ? 11 : month - 1,
            nextMonth = month === 11 ? 0 : month + 1,
            yearOfPreviousMonth = month === 0 ? year - 1 : year,
            yearOfNextMonth = month === 11 ? year + 1 : year,
            daysInPreviousMonth = Datepicker._getDaysInMonth(yearOfPreviousMonth, previousMonth);
        var cells = days + before,
            after = cells;
        while (after > 7) {
          after -= 7;
        }
        cells += 7 - after;
        var isWeekSelected = false;
        for (var i = 0, r = 0; i < cells; i++) {
          var day = new Date(year, month, 1 + (i - before)),
              isSelected = Datepicker._isDate(this.date) ? Datepicker._compareDates(day, this.date) : false,
              isToday = Datepicker._compareDates(day, now),
              hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
              isEmpty = i < before || i >= days + before,
              dayNumber = 1 + (i - before),
              monthNumber = month,
              yearNumber = year,
              isStartRange = opts.startRange && Datepicker._compareDates(opts.startRange, day),
              isEndRange = opts.endRange && Datepicker._compareDates(opts.endRange, day),
              isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
              isDisabled = opts.minDate && day < opts.minDate || opts.maxDate && day > opts.maxDate || opts.disableWeekends && Datepicker._isWeekend(day) || opts.disableDayFn && opts.disableDayFn(day);

          if (isEmpty) {
            if (i < before) {
              dayNumber = daysInPreviousMonth + dayNumber;
              monthNumber = previousMonth;
              yearNumber = yearOfPreviousMonth;
            } else {
              dayNumber = dayNumber - days;
              monthNumber = nextMonth;
              yearNumber = yearOfNextMonth;
            }
          }

          var dayConfig = {
            day: dayNumber,
            month: monthNumber,
            year: yearNumber,
            hasEvent: hasEvent,
            isSelected: isSelected,
            isToday: isToday,
            isDisabled: isDisabled,
            isEmpty: isEmpty,
            isStartRange: isStartRange,
            isEndRange: isEndRange,
            isInRange: isInRange,
            showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths
          };

          row.push(this.renderDay(dayConfig));

          if (++r === 7) {
            data.push(this.renderRow(row, opts.isRTL, isWeekSelected));
            row = [];
            r = 0;
            isWeekSelected = false;
          }
        }
        return this.renderTable(opts, data, randId);
      }
    }, {
      key: "renderDay",
      value: function renderDay(opts) {
        var arr = [];
        var ariaSelected = 'false';
        if (opts.isEmpty) {
          if (opts.showDaysInNextAndPreviousMonths) {
            arr.push('is-outside-current-month');
            arr.push('is-selection-disabled');
          } else {
            return '<td class="is-empty"></td>';
          }
        }
        if (opts.isDisabled) {
          arr.push('is-disabled');
        }

        if (opts.isToday) {
          arr.push('is-today');
        }
        if (opts.isSelected) {
          arr.push('is-selected');
          ariaSelected = 'true';
        }
        if (opts.hasEvent) {
          arr.push('has-event');
        }
        if (opts.isInRange) {
          arr.push('is-inrange');
        }
        if (opts.isStartRange) {
          arr.push('is-startrange');
        }
        if (opts.isEndRange) {
          arr.push('is-endrange');
        }
        return "<td data-day=\"" + opts.day + "\" class=\"" + arr.join(' ') + "\" aria-selected=\"" + ariaSelected + "\">" + ("<button class=\"datepicker-day-button\" type=\"button\" data-year=\"" + opts.year + "\" data-month=\"" + opts.month + "\" data-day=\"" + opts.day + "\">" + opts.day + "</button>") + '</td>';
      }
    }, {
      key: "renderRow",
      value: function renderRow(days, isRTL, isRowSelected) {
        return '<tr class="datepicker-row' + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
      }
    }, {
      key: "renderTable",
      value: function renderTable(opts, data, randId) {
        return '<div class="datepicker-table-wrapper"><table cellpadding="0" cellspacing="0" class="datepicker-table" role="grid" aria-labelledby="' + randId + '">' + this.renderHead(opts) + this.renderBody(data) + '</table></div>';
      }
    }, {
      key: "renderHead",
      value: function renderHead(opts) {
        var i = void 0,
            arr = [];
        for (i = 0; i < 7; i++) {
          arr.push("<th scope=\"col\"><abbr title=\"" + this.renderDayName(opts, i) + "\">" + this.renderDayName(opts, i, true) + "</abbr></th>");
        }
        return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
      }
    }, {
      key: "renderBody",
      value: function renderBody(rows) {
        return '<tbody>' + rows.join('') + '</tbody>';
      }
    }, {
      key: "renderTitle",
      value: function renderTitle(instance, c, year, month, refYear, randId) {
        var i = void 0,
            j = void 0,
            arr = void 0,
            opts = this.options,
            isMinYear = year === opts.minYear,
            isMaxYear = year === opts.maxYear,
            html = '<div id="' + randId + '" class="datepicker-controls" role="heading" aria-live="assertive">',
            monthHtml = void 0,
            yearHtml = void 0,
            prev = true,
            next = true;

        for (arr = [], i = 0; i < 12; i++) {
          arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' + (i === month ? ' selected="selected"' : '') + (isMinYear && i < opts.minMonth || isMaxYear && i > opts.maxMonth ? 'disabled="disabled"' : '') + '>' + opts.i18n.months[i] + '</option>');
        }

        monthHtml = '<select class="datepicker-select orig-select-month" tabindex="-1">' + arr.join('') + '</select>';

        if ($.isArray(opts.yearRange)) {
          i = opts.yearRange[0];
          j = opts.yearRange[1] + 1;
        } else {
          i = year - opts.yearRange;
          j = 1 + year + opts.yearRange;
        }

        for (arr = []; i < j && i <= opts.maxYear; i++) {
          if (i >= opts.minYear) {
            arr.push("<option value=\"" + i + "\" " + (i === year ? 'selected="selected"' : '') + ">" + i + "</option>");
          }
        }

        yearHtml = "<select class=\"datepicker-select orig-select-year\" tabindex=\"-1\">" + arr.join('') + "</select>";

        var leftArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/><path d="M0-.5h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-prev" + (prev ? '' : ' is-disabled') + "\" type=\"button\">" + leftArrow + "</button>";

        html += '<div class="selects-container">';
        if (opts.showMonthAfterYear) {
          html += yearHtml + monthHtml;
        } else {
          html += monthHtml + yearHtml;
        }
        html += '</div>';

        if (isMinYear && (month === 0 || opts.minMonth >= month)) {
          prev = false;
        }

        if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
          next = false;
        }

        var rightArrow = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/><path d="M0-.25h24v24H0z" fill="none"/></svg>';
        html += "<button class=\"month-next" + (next ? '' : ' is-disabled') + "\" type=\"button\">" + rightArrow + "</button>";

        return html += '</div>';
      }

      /**
       * refresh the HTML
       */

    }, {
      key: "draw",
      value: function draw(force) {
        if (!this.isOpen && !force) {
          return;
        }
        var opts = this.options,
            minYear = opts.minYear,
            maxYear = opts.maxYear,
            minMonth = opts.minMonth,
            maxMonth = opts.maxMonth,
            html = '',
            randId = void 0;

        if (this._y <= minYear) {
          this._y = minYear;
          if (!isNaN(minMonth) && this._m < minMonth) {
            this._m = minMonth;
          }
        }
        if (this._y >= maxYear) {
          this._y = maxYear;
          if (!isNaN(maxMonth) && this._m > maxMonth) {
            this._m = maxMonth;
          }
        }

        randId = 'datepicker-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);

        for (var c = 0; c < 1; c++) {
          this._renderDateDisplay();
          html += this.renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId);
        }

        this.destrGZUi|á£Ôµ+:‘!r|.’˜:Å“n4¢2#®-…îÈmˆCÿ 
    ™ÿ“ÓğÑü…?dñÙ¶ÏßJ/¾r?¾«C¡)À æ·@ÒYjÆIA•z¾^<Nn¢=Ødö2*ßlàj[i“CRlëÑ€Ü\A5ôçZ9üããïf<€Šş7"n ³Üm#¢0°h¹%åğİ¨+LhÍO}•Àb?Üè“Ö…Ğq=Û)dù˜ÿ 
   <ÿ“çáè¯Â›ğêÙø{Í~_?Nİ1øuP Ê†Ò5t&iç»@•²/²&Ô+Ãß3x´K¶DäMã{Òo–xZ“ñ“[,ÿx¼1 ¯’Zi-CtôH=‚0[}_tUŞŞ¬2ÛnÆš»ûã'(¥m'“.úp‚¦)'éĞAb£JÌ˜¿>>Bä8°ÁíØs8ëM?%H ÛvÍlVQë™[0ìóÔ 3’ĞAí;Ÿ&y:·šÁNÒÔ‚&Â¬ˆ>Pg¥É) wH´¸ó)z¥ÏO¿)¡cÎj½æÔt‚ ÈÍEë9qÇrø´5lÛSèí¯G^ô¥j‰+\®è9£÷¼ƒxdÜb‹¸•Ë&$cœ¶~°vuŸã“Ü&3€Ÿ9,ÚJûû¦k_ı„İâRš+±µ©ÎnhÇí« ƒ!±ÜÁ’‹#–ïXÎš€’îEª@W¦Å‹ï~˜ÍRcvmVSjÔ¹;ODœù¾" ˆ¢;}ˆ6mîğZğ/,9B‡éB
±b9`p¹°ölŒ
#ÛŒål¡(ÎóØY3†ÚÒúÅrZ²uƒå\•ÕÒMè½Ğ¸O6Ãƒ¶ÑäÔ?¶‘{¼(!|^s ê2@Ñ¼}T¹ÌÁ$xód#Ö¢Ê/Ó·ÚNåğ…°&îaOí°YäW“Ãd (Pçm³=ièÚF­«l"·TB
zÜR/ªr}OgEÒœ¾F¥ÎØÿ4	EÉ=3©µ»§,š„zïzZÿ`ú°Ó<ïVNï±ĞNKšßÈ0ş€¹×¿¼i]~³caC?"³á‘D¢Ê:#2!±<Ò•Û¥=EÂ?t(_5EĞ„hP˜ñïO Ø­_6“\€WCg¿G?1íßßIØ0Ğé'RÌ}(¯)İÌÖ°uxÕ±=éì~ ¾jìf—S°ñˆìùó;¨¡$ÎOí[Û†&9€XW¬‚¸õ)Öëv­ÂˆKš÷Ãÿqˆ…[›OÀDó÷ø ÿRC:¤vwqÊíÔ°`·Å““/ô¢Ú†ËNVÎE¹ŠdnnÓ0z¢w(ê>A~¯Ôÿ 
   ÿ“Év¿ğ•'àÔ	’~+á€ÍRú AÁóv%ü¸[®ĞÓ¾²‚·3ağ=Eq·°#àªDÔ±ı„ë/×Ñ®êÑâ’’ÃŠŒ÷ÕÄ7eFüÎÚ•jÁÓÄM4›ÓJd²Å@ÉÇâyĞF­dyi3eßÌÒ‰¿ü—O±ß¨_&d±cŠQ-?‹P±©İbû»€[¹Ã·¡%Úütßà¦~	ÿ>(bA©gŞÛ# úÅéÌÏ•Ê %6š¨KôRĞ­Kèkó4ÙL¡$*úzBD«–®kD}Z[/­«œ)$RGŠ÷0-^®­-s8l=MOâ¶¢+f<ÿ 
 	   ÿ“€ÿ 
 
  5ÿ“åÊ?‡£®ğÖçáoğ÷mÇşƒÏÀGáÜWiÀ¬ñ+$P*Ö×AD[a1İÛF"İA­_>Ğ¸/oÔèybb×³ZOæ 2¨ZÈi>’UËy¹DŸ™5øÔ1˜ ç¸ª÷Ìõ,»³Lj¬rÃ]ø}Ú î½nâˆƒÔ”Z²åêİ<Fãá?İˆ\;+plß]1ßL©rÔş—a¢ƒg%Ì3¬˜;Š“8K¾qˆã¸g+!(ˆ¦©oÊ©f5Ö¾3g‡Tq	éâë¿¶ˆ|9¨Äi¹û	ûT+tsf`â¾»iw>Tãƒ²ÿš¢íWİM1ôÎpâõı>Âõ—¦#h˜?&›Ğîï¼í‡…-ş¨	‰¿	–¢‡_€Í°¢qİ5Sß v7Jé$N$ØÏl¾lQ;¿7¿jÓó»û¹OæêÌAKû†xÑ¡“ˆ)‘²<?ø1[|³)ràfÁ
\ÁuÒb¶µkÔ¶øÿo‰ğõÌÿÑ8Òâ„”‡§S½ñ™.Ëïo9º(QS³Õ}ÜxrĞİY)—ƒñ'>ú#ücHºa}¼»ËÈ³óiTmózH}Y·ï-ñ÷|rÒÙ€#£˜ü¥4½4–æU.–dÆXÿc¯7^‚¶‹ø¶ê/ÙˆÆBö@M~xCld§2ìF'ça0¾âÂNõè3Z—	ğéÚƒÄ6N©ÄÍ«ñ”nšrÌ9±åùe¹jS¿ârù¾{‘ßÈ ®%Â°x@Ç‰rÒJüSMä\Í^^.|‹qÜeëÉ1Z&í‚5—mZ%„‰F„=ÜLQÉñŒ8AßéµˆÍÏ­1v¯Sc¿V7[WhjA˜’b±R†&ä‚ùfglT“íE^!Ö€‘i·Öş¬‘y~i¡uYuhş¾ªÜ€cSTƒ¦bü¯Ï¶=_¼UŠa,Æ,'úÏe`1Ñoè#¦J½HcùÑ±ÛŠ¸~(M•©ï#’”À,R(/5¾Ô'îAw%ÓN7ü„$uê€æa÷13Ü£Ó`3 ÿ 
   Îÿ“çáêÏÃ¦ÜC?xşñü7á¬ÏÃĞwzğ5+€'U(Øş	€ù¶äßUƒìÚP+Ö*[£şhjõg†*Î1‚G¸–¬DÑ<'«YÃ.v³7Ò‰
Kèõ-I§bÛûO_Æ	«,¬ªaDÂ0ï=Ÿ¾Â[Ì7'g0¥í´­CnxVäçtŒ+ğq¶cn(uBÖ:ZgEaÌ‚Äôg¶q×ú—ò¿œa[’ ö¾Oº«Wû‰üÉÑÕ)h	)#˜œf6™…i7°å+C3«¯à¨=¹·šxÿDo(#.AÔvW­¸–d™šûÒ+Å!¶ÿ&^«\ÏA;†n¹ç9¢Ûv€;ÉB¢bÙªç±¦ HLLìŒÁ¶Á/yÉÍÆü6Gw…[|ùCõ"/z•%;iq?ık:Ï‹ò‘¨Íˆì8§O,pQrv¦<•ÕHÜå'U‚4nC‚½QÅ¶•¡QæãNb™Éù	ÿvØ¬‰sˆ	lx o ¼I”äy—–Ğü`T’£¡‹è ±Ô)í@ ‚m)Û$` 	zmÉç~\`ª'H!u@Y„°$]ß1„e:³¥[wÊ`–CÉ§†èŒK’ÄœyK¸‚°r±ªWßxÓu2VÇò;Ù·	–ÏtÖLõÏ"n3é4AÈI¬S'¯İ=µ43å¿nRI8Ìyµ+ì,	{¥qc†’e«ˆ€Ğ«¾ÕŞ’sPôdå
±óo;s.€9Åˆt ä'ù/¦Ä.([ªÚ¤Ñ¿I¶ª.¬7.U<f¶À½ÇphÊÅo	Ê~ÕïZÚ4õÉ·‘(0Á¼IåKÁô<ø²à%}µ÷¯ Â•h¼ybâw¦© .ö`•şiŒô•PdÂùJ4¿²„¿¾Ğ0hüvC©¶Qo4B°m”#lê
—\Û2Rét]q	Ñ¾ArõCü18-Ôµ±&ZX*p¼Õe‘@0 Â×WP*O§PÒğÜ/¥‚dİ)J8,Œ™Ó…¤´R4>€¼KF,è
Œ{gõ„ü²¡f$µñµGlgdZT=^á·–Á®!4è{ªr³›
SÒM8¢?É±jÀ÷^w-L;àñ»Œ¡M¶ş~$4(Ê§¥Õ–HXêÛ‘#n~«fØªRtN†oÕª* zEÆP½tid”\.n\W¯ÿpX¹;,m±e'7TCÁğ:ïÙ‡a˜dUj,óãÅ¾QKhÓÚâÂB_N!¥<ñ*#LÕo,·)Î»Ii…Â@º6,Í¿!¨WÉüñóoÔêËé-÷­% 8>®é›á:a_1¡{Šu,¦º2½`¤€¿³:1ã\^"¯x¸§«ØOauC	Àuck@nÔŸ^x9^W‰*„Õe>®°¥	ë~¯éi´şİ­äeåÖp¤ÏmÛ|V~¿bZ6­ğ‚F&($ Ê.e‚PSgO }?t’Kw=ş>÷AÑÀè‹ÑšUSU‹'>!óf…X>iİ‡Ê=]°ô=³¤šÄğ4ŞÄü’Eº/âlåål¸(¦§‹M_éWuÚ²Nÿ 
    àÿ“äKµ:ê¼Gò^ê·oë>ì¾í~ôgê?v5´=¼ûY¾Ò~Ù}ÜJÜöŸîÑÌÖ¥i®Ğ{K[•ºoÚÿ]´•Ò{© ÔˆaÃƒun¢×<àjñD¸Õ­ô™Ó³fÿ<gÿ+ù,ä'
ˆ/ò<Sg×©¶CU¾S
#öºèP†ëbpTü3#Ğ¶ö’¢=ö	Ãêş7Ï‹u¯Ä>uÃázZİ!g`2BI˜fFq@áÎ™^ö4¡î¿x§æ¿iÛ´»ÎÄ·Œã;n3u’Å@¡yåĞ¡Ë;_,ñe2!ğÌÜ®¥º*öK:9]Á»g÷øõUqçI¡vkìdàÜxÂÍœ+Û0èê›¨eL‰Ê©R9‘×Ú–ù£´`_¡§•—‰á‡ˆI…‡ØsS<¦Ï3)¶¸E¬ 1^Àİñgå5‚Æß|‰KqˆOß‚µ,!6c¶7çX¢á§"T‰‡úÈ’·ôğ¿	×«ğ“E·“Ş1L+'R•RÃäÌ–VIõá’Zìßå:ó$léö°c°çzjÑÎ7ÛÑæn—òÉ!rPE¯îŒÓ„³wèw³x÷O¿qûÑµë]qğ¸Fäü mÂI¾¸ôßÇ>ëhq ¿–
§=¯-ÜK¿ÉfmYÒ¬=±gÅ1=I!#ÇQŠ‚=Rµ	Š½.E}ŒZN9¾r±Êy:mPŠQ¸´‡Üá¹¦6±Sqì!ÇìtÔ$Òÿ^†„dúÀ(îh7ıÍœÜ¢Á•N]!nOk„ÛœÖËL«³ ĞÑ°GS ‘…´İOÀê¸0ÕíEG~ÚÄ¥¦Áó\êŞŒ }75¥¦Œ8Ê`¬H‰TN½_}÷BTğ‰ÀH¼Áâúã‚ñ‘1&íL9µgñ²œ<ïõHÑËƒ3*Ü>­§
¤âd¥üÀO7ø]êMø_.¦[ -z¤Ô¶¾ÂĞ¸«£z¯0­;bOÍ»DRe³a3F
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
        this.el.removeEventListener('change', this._handleInputChangeBound);
        this.calendarEl.removeEventListener('click', this._handleCalendarClickBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleCalendarClick",
      value: function _handleCalendarClick(e) {
        if (!this.isOpen) {
          return;
        }

        var $target = $(e.target);
        if (!$target.hasClass('is-disabled')) {
          if ($target.hasClass('datepicker-day-button') && !$target.hasClass('is-empty') && !$target.parent().hasClass('is-disabled')) {
            this.setDate(new Date(e.target.getAttribute('data-year'), e.target.getAttribute('data-month'), e.target.getAttribute('data-day')));
            if (this.options.autoClose) {
              this._finishSelection();
            }
          } else if ($target.closest('.month-prev').length) {
            this.prevMonth();
          } else if ($target.closest('.month-next').length) {
            this.nextMonth();
          }
        }
      }
    }, {
      key: "_handleClearClick",
      value: function _handleClearClick() {
        this.date = null;
        this.setInputValue();
        this.close();
      }
    }, {
      key: "_handleMonthChange",
      value: function _handleMonthChange(e) {
        this.gotoMonth(e.target.value);
      }
    }, {
      key: "_handleYearChange",
      value: function _handleYearChange(e) {
        this.gotoYear(e.target.value);
      }

      /**
       * change view to a specific month (zero-index, e.g. 0: January)
       */

    }, {
      key: "gotoMonth",
      value: function gotoMonth(month) {
        if (!isNaN(month)) {
          this.calendars[0].month = parseInt(month, 10);
          this.adjustCalendars();
        }
      }

      /**
       * change view to a specific full year (e.g. "2012")
       */

    }, {
      key: "gotoYear",
      value: function gotoYear(year) {
        if (!isNaN(year)) {
          this.calendars[0].year = parseInt(year, 10);
          this.adjustCalendars();
        }
      }
    }, {
      key: "_handleInputChange",
      value: function _handleInputChange(e) {
        var date = void 0;

        // Prevent change event from being fired when triggered by the plugin
        if (e.firedBy === this) {
          return;
        }
        if (this.options.parse) {
          date = this.options.parse(this.el.value, this.options.format);
        } else {
          date = new Date(Date.parse(this.el.value));
        }

        if (Datepicker._isDate(date)) {
          this.setDate(date);
        }
      }
    }, {
      key: "renderDayName",
      value: function renderDayName(opts, day, abbr) {
        day += opts.firstDay;
        while (day >= 7) {
          day -= 7;
        }
        return abbr ? opts.i18n.weekdaysAbbrev[day] : opts.i18n.weekdays[day];
      }

      /**
       * Set input value to the selected date and close Datepicker
       */

    }, {
      key: "_finishSelection",
      value: function _finishSelection() {
        this.setInputValue();
        this.close();
      }

      /**
       * Open Datepicker
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this);
        }
        this.draw();
        this.modal.open();
        return this;
      }

      /**
       * Close Datepicker
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this);
        }
        this.modal.close();
        return this;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Datepicker.__proto__ || Object.getPrototypeOf(Datepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_isDate",
      value: function _isDate(obj) {
        return (/Date/.test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime())
        );
      }
    }, {
      key: "_isWeekend",
      value: function _isWeekend(date) {
        var day = date.getDay();
        return day === 0 || day === 6;
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }
    }, {
      key: "_getDaysInMonth",
      value: function _getDaysInMonth(year, month) {
        return [31, Datepicker._isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      }
    }, {
      key: "_isLeapYear",
      value: function _isLeapYear(year) {
        // solution by Matti Virkkunen: http://stackoverflow.com/a/4881951
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
    }, {
      key: "_compareDates",
      value: function _compareDates(a, b) {
        // weak date comparison (use setToStartOfDay(date) to ensure correct result)
        return a.getTime() === b.getTime();
      }
    }, {
      key: "_setToStartOfDay",
      value: function _setToStartOfDay(date) {
        if (Datepicker._isDate(date)) date.setHours(0, 0, 0, 0);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Datepicker;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Datepicker;
  }(Component);

  Datepicker._template = ['<div class= "modal datepicker-modal">', '<div class="modal-content datepicker-container">', '<div class="datepicker-date-display">', '<span class="year-text"></span>', '<span class="date-text"></span>', '</div>', '<div class="datepicker-calendar-container">', '<div class="datepicker-calendar"></div>', '<div class="datepicker-footer">', '<button class="btn-flat datepicker-clear waves-effect" style="visibility: hidden;" type="button"></button>', '<div class="confirmation-btns">', '<button class="btn-flat datepicker-cancel waves-effect" type="button"></button>', '<button class="btn-flat datepicker-done waves-effect" type="button"></button>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');

  M.Datepicker = Datepicker;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Datepicker, 'datepicker', 'M_Datepicker');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    dialRadius: 135,
    outerRadius: 105,
    innerRadius: 70,
    tickRadius: 20,
    duration: 350,
    container: null,
    defaultTime: 'now', // default time, 'now' or '13:14' e.g.
    fromNow: 0, // Millisecond offset from the defaultTime
    showClearBtn: false,

    // internationalization
    i18n: {
      cancel: 'Cancel',
      clear: 'Clear',
      done: 'Ok'
    },

    autoClose: false, // auto close when minute is selected
    twelveHour: true, // change to 12 hour AM/PM clock from 24 hour
    vibrate: true, // vibrate the device when dragging clock hand

    // Callbacks
    onOpenStart: null,
    onOpenEnd: null,
    onCloseStart: null,
    onCloseEnd: null,
    onSelect: null
  };

  /**
   * @class
   *
   */

  var Timepicker = function (_Component16) {
    _inherits(Timepicker, _Component16);

    function Timepicker(el, options) {
      _classCallCheck(this, Timepicker);

      var _this57 = _possibleConstructorReturn(this, (Timepicker.__proto__ || Object.getPrototypeOf(Timepicker)).call(this, Timepicker, el, options));

      _this57.el.M_Timepicker = _this57;

      _this57.options = $.extend({}, Timepicker.defaults, options);

      _this57.id = M.guid();
      _this57._insertHTMLIntoDOM();
      _this57._setupModal();
      _this57._setupVariables();
      _this57._setupEventHandlers();

      _this57._clockSetup();
      _this57._pickerSetup();
      return _this57;
    }

    _createClass(Timepicker, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.modal.destroy();
        $(this.modalEl).remove();
        this.el.M_Timepicker = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleInputKeydownBound = this._handleInputKeydown.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);
        this._handleClockClickStartBound = this._handleClockClickStart.bind(this);
        this._handleDocumentClickMoveBound = this._handleDocumentClickMove.bind(this);
        this._handleDocumentClickEndBound = this._handleDocumentClickEnd.bind(this);

        this.el.addEventListener('click', this._handleInputClickBound);
        this.el.addEventListener('keydown', this._handleInputKeydownBound);
        this.plate.addEventListener('mousedown', this._handleClockClickStartBound);
        this.plate.addEventListener('touchstart', this._handleClockClickStartBound);

        $(this.spanHours).on('click', this.showView.bind(this, 'hours'));
        $(this.spanMinutes).on('click', this.showView.bind(this, 'minutes'));
      }
    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleInputClickBound);
        this.el.removeEventListener('keydown', this._handleInputKeydownBound);
      }
    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        this.open();
      }
    }, {
      key: "_handleInputKeydown",
      value: function _handleInputKeydown(e) {
        if (e.which === M.keys.ENTER) {
          e.preventDefault();
          this.open();
        }
      }
    }, {
      key: "_handleClockClickStart",
      value: function _handleClockClickStart(e) {
        e.preventDefault();
        var clockPlateBR = this.plate.getBoundingClientRect();
        var offset = { x: clockPlateBR.left, y: clockPlateBR.top };

        this.x0 = offset.x + this.options.dialRadius;
        this.y0 = offset.y + this.options.dialRadius;
        this.moved = false;
        var clickPos = Timepicker._Pos(e);
        this.dx = clickPos.x - this.x0;
        this.dy = clickPos.y - this.y0;

        // Set clock hands
        this.setHand(this.dx, this.dy, false);

        // Mousemove on document
        document.addEventListener('mousemove', this._handleDocumentClickMoveBound);
        document.addEventListener('touchmove', this._handleDocumentClickMoveBound);

        // Mouseup on document
        document.addEventListener('mouseup', this._handleDocumentClickEndBound);
        document.addEventListener('touchend', this._handleDocumentClickEndBound);
      }
    }, {
      key: "_handleDocumentClickMove",
      value: function _handleDocumentClickMove(e) {
        e.preventDefault();
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        this.moved = true;
        this.setHand(x, y, false, true);
      }
    }, {
      key: "_handleDocumentClickEnd",
      value: function _handleDocumentClickEnd(e) {
        var _this58 = this;

        e.preventDefault();
        document.removeEventListener('mouseup', this._handleDocumentClickEndBound);
        document.removeEventListener('touchend', this._handleDocumentClickEndBound);
        var clickPos = Timepicker._Pos(e);
        var x = clickPos.x - this.x0;
        var y = clickPos.y - this.y0;
        if (this.moved && x === this.dx && y === this.dy) {
          this.såö8É@é+œ+k…D®`Ëq³kb†³İ=>M'	û¹¸ì/'ÅFŸ’=¨ÜØxCÈ¸=Ús‚¯b€ò"?
»Âæ‘ğ3ìÈ"şØMH‘Jÿ8Sa¦É•:A#¬ô-´ÃĞ­¼´¿DŞÜ=IzhJ$¬ê¯’ıXt‡ı~ÙiO³Ìy‡¶]MM‚üxA-v–Òîv›İÀ*ÇùAD‹ÁP×<«}ìÇ”¥‘1W$SêK·Bi²˜ÿ.ù}¼Uí¾FC;§oõJ¾7"iq‚ç|höH)àÚÅÁÑ$[¦ØÛp}oà1>9¹x\°¯¾È3°²2ÎÃ{qÿ 
   °ÿ“óî«ïJ~Üx¿h}qëg>éê½î“î¿îñîëî›ıÑ¾é¶ŸP‡-«ºïÛºİk‹ê ‘¯
X‰h‡&V÷±mùÏÈĞ&i¬è\Sè$y¤eRâ"g^š¢ß³`üE†x#9üÁ#¤6®7™÷¥tÍî[ÙÖ€E¢: 2AŒî‚ö4.JpÒèzÈ×?>æÁO¹‰²Ä—õf¤f²¸ƒ/Ğˆ…£ªšÏbRíõºyÌ­¬iÍ…WR¾eøà?ÓÎ”¯:Â¨«mS7—w60i%XJqÀ÷	vqï®Ç·¾“Ş¸§¤5c·_Ù·gø½(¨º¤è—Wª¸ª¹3Œ)Ÿ÷SÙ
ğšà«Ó‰ªãÖÎÛsÕ‚Ë¢¥·8¶¶¹ê¢VûğK¢¯6&	,#aïpW	½˜?Ø0*>GA ùÙ“Ç=LD{¬Ä!°*i{èï¸şQr÷œånÛ0×ëYz<Ì—C› )p	Òà¹Çñ¯ê>3ùÙ8x¢AÄi
@ísN¥Rà”¹ÕU›¢aé×#a˜¢[ù©z-Ç'ô_g?Hú™|«ópe¥Q¼ÀdoREıÙyoäIÌáXÙáZ5;q–±t*'‡Ës†ùC(³}Ür$w/ÿàû´ûB;k…YT'‘–E=ó(Ã[ûY1^`Û°+pTãò$ÃK:¥hD§”øÓÒwœ™ùª‘fq¿*Ib5›× *4T½/Èÿ	jÌ!Ó—äˆ»¤øÕ·)yœ0sM^úşZü­Db¢éÛY z[
_Œ@án-ÇZÙüÄ·q+L%ÀRÏ%$ã0fú)`ÛIÑâY,Ø…È´‚[òíWk§½MÈ¸·M^ğ)AÕV]Ê>ˆ·ûKÂ¹yAÜÂ»I(JV%Y²n…÷ywh?VÉˆg9oOˆºœÂÂŸ,!û:ŒĞ^Ì7öÇ{æ¦£|pHY­Š x3Ó·½RmtáøX—<´læßa:Ço?—9şHÕ!ïQ®ìÚ­æRliÔ!â,–Nj.Ô
¡uŒO1F$éjÚê)Ëqoæ‡•‰|2#¡¼µ~@x[³C/lí¤ÙYşæ„¬¼³8mãïî,{4kdP-Q×z°Ş»W§öh²‹eÆ{éàùĞB8‹è¶ŞÌ¬MŞ›Q'4o'ëC_Åç#˜Ó˜¦¼ø·õ[Áÿ´^ªš„•óG®,³26ë¼{Ã“ï`àw(¢Û%3/d{eÜç_[øiöwãmõÿ8P›WÃ;r7n/¾‡=‚‹]°¦;Z€dŒı,_¼¸öˆ©£GYä~ôË©ôV3X‚ ¡©)<¢™.VúÎ`¦±Sÿ»jÄx#‡\\`73jJÃQÄzÁG%¢á‚äo?Œg	÷ì6Q‹´Åõ„-¶%a{×î³‘ù‡q áC_¢€~Î,ß¼5˜$°®¿ñ¶2í)Xş“Ëç,³n±j©EWNÊgëÔaû«j|³TCÒ$ŸTË'Qï;
$Ô2w6«É)æR¬ÄºÍè Ìx`¡Ó1OÅp(ë/„çáÍ¢ Ìuc½eˆq‰æûÏXa\\:üÌÀl–Pü ù(G'Á‚îño»FTeK¸ù£Pşâ§øÇÀFÉßÚEÊ™±6”a)$ğê×@µG£²Â*(¤ï¶ò÷ŞæıG»Œ3TÂ¶`~NÃ¸ÓÇ|¨¥/ö—(lØ.Ñ£*µMÜÜÌQ_‚fŠ)`Œ¹è}nƒõ…6~o	"µ’”m"1^m Ä3†%uùÎÔñÊ‰ãQ‰lò4uğYÅÂ¢lÔ¾İÛˆNOÿì®Š¤~[-½¾«…Ö#ÌX‰@27QëÒ:‹Qî2¬Hö¿7aDSKŠhù¾’1¿M±Sst9ùš§ÔTòFÊñÂ£&?†ád›@G°;1*ó²Xé¼ŠÑˆßFØñç¸Œf$¨·§Ù• u8ÖÏ%•n‰‚3©t»Ëû3F=¡x¥rÇéÎcã¯¹5¯ÏU„¯b¾Ú;Ç¬P¯ãhüöWß::çåşf,¼‰ÊkÔN†""JHh ÂØã3sK\DNIıRJ \–e˜›ğhéCıLuÌ¶GÁL"{@S–•­ë+ovØyİËiœØ¨Àü05àÕ )j¤Ø¦ÿÙendstreamendobj61 0 obj<</CropBox[0.0 0.0 467.717 680.315]/Parent 148 0 R/Contents 62 0 R/Rotate 0/BleedBox[0.0 0.0 467.717 680.315]/ArtBox[0.0 0.0 467.717 680.315]/MediaBox[0.0 0.0 467.717 680.315]/TrimBox[0.0 0.0 467.717 680.315]/Resources<</XObject<</Im0 63 0 R/Im1 64 0 R>>/ColorSpace<</CS0 132 0 R>>/Font<</C0_0 121 0 R/T1_0 126 0 R/T1_1 122 0 R>>/ProcSet[/PDF/Text/ImageC]/ExtGState<</GS0 171 0 R/GS1 123 0 R>>>>/Type/Page>>endobj62 0 obj<</Length 3590/Filter/FlateDecode>>stream
H‰¤WÛr7Íëò+ğˆÙ"Ç`®‰J[¾ne?l™Uû mmQä(dÌ‹â¡bëç“í0˜M)‰]G qĞ}út÷«ù$Søß¨“ÿü©ŸºÉ‹×Ùÿğ›ùí¤¦—µÊË´q•*]‘æe^¨ùnr‘eÆÂŸŒÿU?-|Ú:Ë¼·|Âß.çgû~dƒ}#ïs^cßÁg&Ÿ|¾îŸ{û—óŸ'oç“WóÉ‹w‹½º¸xñry¼_lçí—£Ò¿ışÍ<¹¼|õæµ:uSeiS¸ñU\NfßÃ&±ı,'˜25Y	oç+´‚—¶Åó@¾=òÔIUZ×ŸTü9¼uj¼•«ñpÁ¦ø5%|Æèxg/Ë÷¼»üïü_OÜnùÇng‹ÔÑíÜŸºX©KùH¨ç/ö®§^ü9Qúƒ÷pYZ”å_½‡3©­ò>Jœ— û‚“›‚ş(G×ä•ŸsãÊÒÌÁÃge$Ù3<µªL©\p {¥»e2Ëu›˜Lï[µNŒÕ‹dÖèN“BÔşÑªîpŸ”ú§dfs‹œ>ª|±W‰Ñ{Ş”ëOøğ	I£øÇæ íÕgXÚn“Y©·bğö@ëk0 ôÈP ŞLÍÀjş°‘‰u«P4©t'¦·ê‡Ääº·‡Hö+å7_ƒû©ÜÌÀ@ĞÑ|Ñ"¾OL%è	y¯J­­9,z–@d3Ê~x5“wwåáö°<€·xÀ¶½'Ğt0øaC(ÕûÄ5úa|9¼Ä¦ípQŠàËVíÑáoÇŞ£uŞqYiÏüï İ‘ù¬Èi65ˆr§6Z`Å|Rè_“`–âÇT·ù‰Ş2dôä’ü“ë=s€9B@f€ÄT‰¸šbNG©…ÚõAºóO°Ìéå¦kÕ–] OäÌ!]?Ãñ~u>fäÖÉ˜1‰ƒu†ó˜½ç3ø8Dğ4ËŸóà­0-•<ˆÛVxŞ§Å\t™NıÅh¥#£V”Ñ%˜%Û>¢Ç;4Å€Á¯G„·P·ôr%gÄÙ9Ÿ kxI1,)Wú]b”p5PÓT‹d,:N_'J¥`ŸĞùBô;¡ü,Ï…‚èp‚«ô·ªOnXˆÀŞËá)^™˜-®ºJ¤X±¦!c2ŞµÆÂŸ­îÑŞ% Å‹£†Q”Èksí]†—¬ønvø¿vG$™ö+ĞÆÅˆ~o <!¥M (k!3>Â]jıZK€]ĞË7éû—”H¨ø.±o‚QPÏ©ÈòšxŠ„],®XüÉ;ìõVoØiğkõ€£ä9ôÒò}KKŞ.Ò¨•Ï©;Ö8^8f!%Ní§‡g¡
ÌÀ%°SÉ½ûÅÖ‘„ÛÔúäJûºqê@èŸø@CÄ¹Bˆ€®¥¥<¡‚ºóæiÎ›*âô~%¾!jIY“¶q8–ë¯Ğ*„È]feZÖ.Ê4®[ŞĞS5‡o©Ä!–ã¨¢(0§ô¡S½Ò…ÛO’»'”¸©Ï(1'°±4N™·XÔQÂZ{¹W·YµSµYIS€)@™†€‡DÛõ7¢‡ ‘aƒbQ‹'§PĞwƒG„e%sœ÷õ¼¹¶¶\ùê™Š£ìI­ÿ>U?Æl\·£ëS4ï)ù¤Z
YÑ!Ş/\ø8%ûŠÀ|øˆ¶úx@Õ D—èÏ<E‡mˆ)Ê“r/iÅT7²!ì8è×¯á^©U+ÔÄĞl¶#)éË—'š·Úœ¦~çÏ<Q<ıôj}6©ÖÜ"E\€·Ï @>=Ôñä[%ÕŒ:pñ¬íUnà?jv]ŸÚ½vû„¤ômÎ¸æJñP.rië(šé€¨D’½ŒúÄ¾|2z®1âTÿeú}aÀ£	?­qia3ğhIUœfŠ†Áí'kMÚTe®€“aÔÑ¾+q…g@a#üGŠ'F†>‘2*l.÷ôyâ½'}ÑŞ­àèš!µŸ‚„+¾Vı7[Éì|HŠB÷İJÙ÷‡íQ³ä›p£eV‹‹|!X/³~´hqÏçqÅ*qVĞaÆıebØñ~ÂÌĞóY‘š¦©šºTËİDB£~€ûê³¢/v“ÊÂÇvòaòïÉ«yœEZ‰zìª8àŠ*:.$pmBtn.on('click', this._handleAmPmClick.bind(this)).appendTo(this.spanAmPm);
        }

        this._buildHoursView();
        this._buildMinutesView();
        this._buildSVGClock();
      }
    }, {
      key: "_buildSVGClock",
      value: function _buildSVGClock() {
        // Draw clock hands and others
        var dialRadius = this.options.dialRadius;
        var tickRadius = this.options.tickRadius;
        var diameter = dialRadius * 2;

        var svg = Timepicker._createSVGEl('svg');
        svg.setAttribute('class', 'timepicker-svg');
        svg.setAttribute('width', diameter);
        svg.setAttribute('height', diameter);
        var g = Timepicker._createSVGEl('g');
        g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
        var bearing = Timepicker._createSVGEl('circle');
        bearing.setAttribute('class', 'timepicker-canvas-bearing');
        bearing.setAttribute('cx', 0);
        bearing.setAttribute('cy', 0);
        bearing.setAttribute('r', 4);
        var hand = Timepicker._createSVGEl('line');
        hand.setAttribute('x1', 0);
        hand.setAttribute('y1', 0);
        var bg = Timepicker._createSVGEl('circle');
        bg.setAttribute('class', 'timepicker-canvas-bg');
        bg.setAttribute('r', tickRadius);
        g.appendChild(hand);
        g.appendChild(bg);
        g.appendChild(bearing);
        svg.appendChild(g);
        this._canvas.appendChild(svg);

        this.hand = hand;
        this.bg = bg;
        this.bearing = bearing;
        this.g = g;
      }
    }, {
      key: "_buildHoursView",
      value: function _buildHoursView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Hours view
        if (this.options.twelveHour) {
          for (var i = 1; i < 13; i += 1) {
            var tick = $tick.clone();
            var radian = i / 6 * Math.PI;
            var radius = this.options.outerRadius;
            tick.css({
              left: this.options.dialRadius + Math.sin(radian) * radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(radian) * radius - this.options.tickRadius + 'px'
            });
            tick.html(i === 0 ? '00' : i);
            this.hoursView.appendChild(tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        } else {
          for (var _i2 = 0; _i2 < 24; _i2 += 1) {
            var _tick = $tick.clone();
            var _radian = _i2 / 6 * Math.PI;
            var inner = _i2 > 0 && _i2 < 13;
            var _radius = inner ? this.options.innerRadius : this.options.outerRadius;
            _tick.css({
              left: this.options.dialRadius + Math.sin(_radian) * _radius - this.options.tickRadius + 'px',
              top: this.options.dialRadius - Math.cos(_radian) * _radius - this.options.tickRadius + 'px'
            });
            _tick.html(_i2 === 0 ? '00' : _i2);
            this.hoursView.appendChild(_tick[0]);
            // tick.on(mousedownEvent, mousedown);
          }
        }
      }
    }, {
      key: "_buildMinutesView",
      value: function _buildMinutesView() {
        var $tick = $('<div class="timepicker-tick"></div>');
        // Minutes view
        for (var i = 0; i < 60; i += 5) {
          var tick = $tick.clone();
          var radian = i / 30 * Math.PI;
          tick.css({
            left: this.options.dialRadius + Math.sin(radian) * this.options.outerRadius - this.options.tickRadius + 'px',
            top: this.options.dialRadius - Math.cos(radian) * this.options.outerRadius - this.options.tickRadius + 'px'
          });
          tick.html(Timepicker._addLeadingZero(i));
          this.minutesView.appendChild(tick[0]);
        }
      }
    }, {
      key: "_handleAmPmClick",
      value: function _handleAmPmClick(e) {
        var $btnClicked = $(e.target);
        this.amOrPm = $btnClicked.hasClass('am-btn') ? 'AM' : 'PM';
        this._updateAmPmView();
      }
    }, {
      key: "_updateAmPmView",
      value: function _updateAmPmView() {
        if (this.options.twelveHour) {
          this.$amBtn.toggleClass('text-primary', this.amOrPm === 'AM');
          this.$pmBtn.toggleClass('text-primary', this.amOrPm === 'PM');
        }
      }
    }, {
      key: "_updateTimeFromInput",
      value: function _updateTimeFromInput() {
        // Get the time
        var value = ((this.el.value || this.options.defaultTime || '') + '').split(':');
        if (this.options.twelveHour && !(typeof value[1] === 'undefined')) {
          if (value[1].toUpperCase().indexOf('AM') > 0) {
            this.amOrPm = 'AM';
          } else {
            this.amOrPm = 'PM';
          }
          value[1] = value[1].replace('AM', '').replace('PM', '');
        }
        if (value[0] === 'now') {
          var now = new Date(+new Date() + this.options.fromNow);
          value = [now.getHours(), now.getMinutes()];
          if (this.options.twelveHour) {
            this.amOrPm = value[0] >= 12 && value[0] < 24 ? 'PM' : 'AM';
          }
        }
        this.hours = +value[0] || 0;
        this.minutes = +value[1] || 0;
        this.spanHours.innerHTML = this.hours;
        this.spanMinutes.innerHTML = Timepicker._addLeadingZero(this.minutes);

        this._updateAmPmView();
      }
    }, {
      key: "showView",
      value: function showView(view, delay) {
        if (view === 'minutes' && $(this.hoursView).css('visibility') === 'visible') {
          // raiseCallback(this.options.beforeHourSelect);
        }
        var isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;
        this.currentView = view;

        $(this.spanHours).toggleClass('text-primary', isHours);
        $(this.spanMinutes).toggleClass('text-primary', !isHours);

        // Transition view
        hideView.classList.add('timepicker-dial-out');
        $(nextView).css('visibility', 'visible').removeClass('timepicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);

        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(function () {
          $(hideView).css('visibility', 'hidden');
        }, this.options.duration);
      }
    }, {
      key: "resetClock",
      value: function resetClock(delay) {
        var view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
            x = Math.sin(radian) * radius,
            y = -Math.cos(radian) * radius,
            self = this;

        if (delay) {
          $(this.canvas).addClass('timepicker-canvas-out');
          setTimeout(function () {
            $(self.canvas).removeClass('timepicker-canvas-out');
            self.setHand(x, y);
          }, delay);
        } else {
          this.setHand(x, y);
        }
      }
    }, {
      key: "setHand",
      value: function setHand(x, y, roundBy5) {
        var _this60 = this;

        var radian = Math.atan2(x, -y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            inner = isHours && z < (this.options.outerRadius + this.options.innerRadius) / 2,
            radius = inner ? this.options.innerRadius : this.options.outerRadius;

        if (this.options.twelveHour) {
          radius = this.options.outerRadius;
        }

        // Radian should in range [0, 2PI]
        if (radian < 0) {
          radian = Math.PI * 2 + radian;
        }

        // Get the round value
        var value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        if (this.options.twelveHour) {
          if (isHours) {
            if (value === 0) value = 12;
          } else {
            if (roundBy5) value *= 5;
            if (value === 60) value = 0;
          }
        } else {
          if (isHours) {
            if (value === 12) {
              value = 0;
            }
            value = inner ? value === 0 ? 12 : value : value === 0 ? 0 : value + 12;
          } else {
            if (roundBy5) {
              value *= 5;
            }
            if (value === 60) {
              value = 0;
            }
          }
        }

        // Once hours or minutes changed, vibrate the device
        if (this[this.currentView] !== value) {
          if (this.vibrate && this.options.vibrate) {
            // Do not vibrate too frequently
            if (!this.vibrateTimer) {
              navigator[this.vibrate](10);
              this.vibrateTimer = setTimeout(function () {
                _this60.vibrateTimer = null;
              }, 100);
            }
          }
        }

        this[this.currentView] = value;
        if (isHours) {
          this['spanHours'].innerHTML = value;
        } else {
          this['spanMinutes'].innerHTML = Timepicker._addLeadingZero(value);
        }

        // Set clock hand and others' position
        var cx1 = Math.sin(radian) * (radius - this.options.tickRadius),
            cy1 = -Math.cos(radian) * (radius - this.options.tickRadius),
            cx2 = Math.sin(radian) * radius,
            cy2 = -Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx1);
        this.hand.setAttribute('y2', cy1);
        this.bg.setAttribute('cx', cx2);
        this.bg.setAttribute('cy', cy2);
      }
    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        this.isOpen = true;
        this._updateTimeFromInput();
        this.showView('hours');

        this.modal.open();
      }
    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        this.isOpen = false;
        this.modal.close();
      }

      /**
       * Finish timepicker selection.
       */

    }, {
      key: "done",
      value: function done(e, clearValue) {
        // Set input value
        var last = this.el.value;
        var value = clearValue ? '' : Timepicker._addLeadingZero(this.hours) + ':' + Timepicker._addLeadingZero(this.minutes);
        this.time = value;
        if (!clearValue && this.options.twelveHour) {
          value = value + " " + this.amOrPm;
        }
        this.el.value = value;

        // Trigger change event
        if (value !== last) {
          this.$el.trigger('change');
        }

        this.close();
        this.el.focus();
      }
    }, {
      key: "clear",
      value: function clear() {
        this.done(null, true);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Timepicker.__proto__ || Object.getPrototypeOf(Timepicker), "init", this).call(this, this, els, options);
      }
    }, {
      key: "_addLeadingZero",
      value: function _addLeadingZero(num) {
        return (num < 10 ? '0' : '') + num;
      }
    }, {
      key: "_createSVGEl",
      value: function _createSVGEl(name) {
        var svgNS = 'http://www.w3.org/2000/svg';
        return document.createElementNS(svgNS, name);
      }

      /**
       * @typedef {Object} Point
       * @property {number} x The X Coordinate
       * @property {number} y The Y Coordinate
       */

      /**
       * Get x position of mouse or touch event
       * @param {Event} e
       * @return {Point} x and y location
       */

    }, {
      key: "_Pos",
      value: function _Pos(e) {
        if (e.targetTouches && e.targetTouches.length >= 1) {
          return { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
        }
        // mouse event
        return { x: e.clientX, y: e.clientY };
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Timepicker;
      }
    }, {
      key: "defaults",
      get: f fäîQúá<¶Û.Ş’Zø¯ š‘ÄéÇãQ„‚Ø_IŒxªn_Òeß3Æ­í*`ò²ÇYÁäŠ§†ï£>GZ:R0“¤ù…"=wæ)—Ã;9øÛÍî®œÓqIùÕÇ‚èÄd|/Hœ@‘İ;WóN?AièC¹Æe%™‡¬òÅŸŸ¤D±€™™ L±O›#¨¡!µÊè`]äÇ>lª¦<1îÑT( Ú~ÉC¨ÄH¸èBñÎä~“ãnıOMnĞVerRŠp¡ô5”;8r:MñN®B‹öŠ¼ÃÜÕ»ÿh™?Y3n[ÕŒÆ…™L·Â*°~ÀK,²zÚ‹çE'o ›ÈÎ§ÚÑ,a¢ë]Ñ½‚³2(… ÁáXzşMÒY€X„J´ÜL ÛÔùÇl,ó´k'“IÿN]Ì·0·©²~Şk_EH´ş×d;X¨ŠkŒj¿"”Â”lÖä3lF#º÷Æ€	Ã<¹jñ¬q0UƒèÅøñÂv^éxç®¶\T·<¬±‰b(ğ`¨XrÏ~m-W?³ImmÔı®äxR¹­yiq¡~ëĞòÓ$†õLUú{~Æÿ^U8ßwò:{âp€Æ¾rp@;®XÅ{jôúÈ1‡r(«²Œ‰k‚Ïüg£™½ÃÊå,À3½­Qİ/Í‹¸[Op-ÆQĞşŠj©2P	Zı¥÷üwà+°+BKÆJˆšs±ºLfb¦¼})D›^¨Å¹‹ÑHW‹À‚¢.¿fgù]šoHo½<ÖİéğÎV€zœ‘bÜbIr±uRP/„¹kL‹ŠuúS<ÖöÅt¹ÀŞƒ	uâ[ô£fÊzDèl6²«JB·÷ ÏSÂÆÑM¾¬Š!Ûù,€gª—$ILTwÏ©9\FŒ¾!Pì‹v-,Î(ÏuØ¬Ì\’I¥”oôA}§šW"10KÛÅéÔ3›—pü_¾ªzÓâ%
~–Êµõ?oæ­0Ä‘íÛL”'ªL¹íx°”W2îù_îëµƒ>qIèõnÒmÕÚş4ú;Ë¤ßÇ3gÃ2cEeïò½Ô™l1fwSô¨5¬U$Îöˆ´ÆE@A‹U÷LG³‰Oö9Úl¦BŞ¬ìSM7åœË—š}QIÇ¸˜–¢s>T­­j\ÈÇz(xüÂ“tîE§e®F	\/Q "ó@Çø?Ü@	0\ŠCR:2‘‚™#¦d€9rß42[¿É.5Æ“°os¼^¼F{q˜"yëcôo`Ãj·T¸šiB¢tÊÈ5)Âÿ[Ã†¡f_< ÁIÕ&ÜcR‘æ/3Ÿ2×Húhï´|Ÿ^Ğ,¡3‰±y>×g&7"ñT„Ñ´ŞşV„ı(îúŞå„‡V+l”PJŠ~øü’¼ÈÉºÁ~E»á½²[ëé&iñúİ«><İß:G¨g)ÌúzX‘ÅMÎâ91Y3y™6ˆàc:@Î!H$½sCÉ×ª8É®„k»h'¡mä BšL ,°s ÈÔÛ/jÔîèˆäüf=ò²åV¨/(k+j&3_C–‚HƒYâ¼‹«¥ùpåƒoãŒş^¥“·¡)¥nÃƒzÒWßº‡Ø/?^¬ô|-!§†?{î6Ï«ºs*#h®&¯`³u<]µ»}ı"‡NnÏgbŸÏkò2ãoé¢faèc!ïwi§NÈ¼g$|7¦/&©±´Áë3•5Àçow¾ NOÁ[àU‹Ï~%Òùª¢!×kIëÿ;oó´´h=[Ÿş!ù¾czœf2Xá/ÃW¹ÈÀm‹¿×.¼Òãşá[~íäçAvp
s¾kåBÑiÌğQ|)q‰rïcXÃ3íÖSšÁÃ~Ûº&òùèÍÖ½Ëß‘Cùnßòƒ½ÿY¾ƒ"Š•Ù8'…‚kØš{Š.™«„–QùâõïæoŞ×?¹Æ•û{~mÿ~nCh”îíKÎvÈ•¨å{†MK"±»ü>G‡)¶tÂeÙ"N%D™µÄş½µJææâõk˜<^O ÷¢_³Ñ,Hú©*Õíóô±$´õş4pï"ÊUCDR‚‰(zá~ùq0§õJ‡Ãòày]_:+R~%D7ÙÌ“o±GwÙî×MHã]AÇ÷àåb,²0ìDz“HˆwN„½s¬­ŸCVÌæGª'Œmò…Åb@kê*ÿ
‰ÇıûÇ´d9Ù­Çœå’FÀ:j!_Ô£JmÊSc„îÚÃfõ­°á¼Ü0ãg†/q^	±SÈİ§¨ª?e¤jH­í«æŸÿ<ƒş©èä¤fİúE	?¬j‹±yÀİaH ½Öã-éàa[…³\õ´Çqƒu¥C‡5|\µˆ»¸“Ú¼kòŞ„¦%4Â¢ D™(¦Î8é
˜›DPÓL‘h#Ò(H7=¢ßNl>]"øÕënh
ÊIã@d5¡jèÌÔî7L9·á"WÑÔºÙ6ŸÇ»6®Œ‚ùÜv#3Íuİ†U_§)v'µ^éãÈJ¿]ÿ#àÔ¨dv§x¿|?Ş	S0zw'XlèÛ•Ñçğ?B=“àÉó"Ã„ˆ3¼ô{¥ÅRhÉN¬U„Ö¼Â$µ‰“V÷
Î'y2åß§-‡$Édi °w.kqÍuñ«ŠOvdşM5üšjÎªu
[
ÎƒÓC©0±F#)Eåk…:Ò
fÛ±¬Îîä5L$Õ…îƒ0Í+U\gªİ~ÔË–§ƒhå=§n~ oY:¹AóY‡ci7zTZ UÑ·¥-œ¢íiõéT†Ù·Ùğ6HÁ°5jfÄot«à­c,Ø£A]1E²A Mq½p!¹JK„|Ç5:ï8êGŞR!&ƒ‡u,J7Õ§üh=K4Ëğ0üÉT9%şez;¿Ö7ì§Á•BğäTš/¦‡àù>1×ü–ˆ’íˆ†E›\î-©Æ;ã}ãa!‡ƒKøNjmä\ÔD•şän­ƒÀ‰¥PQã[&Ïìzb·Ä¡ğ7Õ›t>e¿‰;›‘àMièÿd{Ô™Ï]í°6p>¶%ÓXÅè.ã¯£zeÉ¯1N ÖIüÈj.^àóÅS1¥¼¢wµÀ™{nènn¨ØtçKÒ½•ã_sÆPä™Bø:õ± Ô±–ü«|ÕÀw´ÚóÕ5‚ŸPo"”¿5pNI<.!-ãÌi«ŸË¶¡¦@ó*-)ëI±!ôeú„Ô7ªå<ˆÙ?üoø*›çd^v$ÄØÀ¡Ûnyš	¡Ü‚÷‚A„ùØ”	ïŠWjù Œb~şÆ‚JhI.Eï†a…Ô5\#hZÿkHß	'§i\²â7@äH@ö($×Ö˜rDË–Ÿ©’Q:¶9¬¥¬ÃİïV#NÔ‚¢ÔùñXxÚ]V1ÁA€Åd+,irYgà=–?H
ªKDCnÁœU¬i¼s-—ì`èé´PÒ4º
_ü-Ó½†‹‚±ûYG\^ëtëù%Ù±‘Ç GO6«îHƒ*ä—òg.— "n¬Œ8àá“~êG¸!üdÄåèÔÃ{&n³úEPÍCi¤øËÜÖÚ~‹éˆ»•F_¹ĞõÑp*yÚqÌŒÓì'©ßQR”uj(
Úbì/”!·ı'ÚJ¢^ŒÒÇxMs2í‡Q~š&™wCÅitFwÉkXM<öÌ2{¼¸1‹³§è(äó¢†ë3âZWÊ»BÅ°C’FEÔtÍ?v4rF;¤÷@ƒ;Gk)şû1û¬šmû8¯ŞfeCw<	$1^ªFb´=—î»ØÉŞOÁ/ıß²xÒ^ö^u1Ñ”ˆ—©`|#á5Kèüf8&îæèì'<mvmµŞj[Ä(È›äÇUY½ğÊdçHİˆ–»V	İR½ã±dª½QŸe%–~¦ÍX»GC/3YÎUôi$Mè[[ãK.L^Ç 7ÃÁe»ÁV8e¶u©¢XU\W¼ŞgÎgÆFÅ›,{ŞNwÊá…‘fT£mgJíàIr4²M˜,BVeˆÅ-‘¼bÙÖÁ'®RŞ°nøúÙ|‹Nƒ¼:—ËågØ4V—Æç¡R½ª}»´›QP…Ÿ„ı².‹, rÚtk:ÏMƒ
íÎ¢k	‹_¶š>snÀ2jÂxO´,¤ËöcÉ¦Fj5‹áºèbüqğÙğ&¹ñÖÔñÎvGnæ«„ÕD-L´äˆËĞHûe9™Ÿ’—„º¨¾»èşq@³Me¶J†
ïéx7×$ûP'µ–¦/(Rº—’çtÁµ1cµo—ÿh &÷ººÕ-Î+ó­Kt“Õ9‡@¢'Lt&¯`8ËÙ†Úî¸Óµ¬ø±”şkiZÈÍƒ‘Êö%á'9sƒ™&ğ¤òeU iŠõEy	¨!m^@®ÉÁ©¾¼°:¥®Şñ©¶ªy<PİÄ~´Ê”s[%}ıİĞs¼®ÚÎÔåşÆğ QÉÁËî3›×Oq™úÂrü”à‰Ô_ğÅ+÷›9ºWo¦”&Ò9'@3ÙïÍtMTØTf4ÊqÉ}:&¼úö¨îÅóÆ¤ÊÒi¡ÔL½ô½uÀÓ€5ÙloXe/7U4ˆDÑ‡k" O?	«8a”§èãÉÿ 
   ,ÿ“á|ş‡WF˜~®…?WG8_WE?·¤³Lİh§ÃîÂ5L±ñcà7‹¤s…UEW¬…äíY³Si¿şóóëÄğúfãMĞ¾U{Íg«B÷)Nê‡ëÓ'ñuê0$£HY2^~É÷Ÿk6şqázÇ­Û~ìjû™uà(¸1•»|NY˜Ç%|óGˆa9rì_Ù±°]ÜI¼ß)ñMÙiâ ĞÜiQXèZõY¦z,Ì,6œ€[{ù¬2µš°¹—ìéés$-Z§œz˜çÖâ©i/¯[İ†ty%ûbkJÆ|ŠwÏ{8eÛ>ÉW6 qÌáÀ›^&Ÿš9¥ù·–ÀñlÖÌ8^SZ‰ziE¼.qq“†j¼z¯?ôÀHr[¨@[;J„Œ7^ËĞµß¹ûµÙ”ÑxÊ{_<Ê´âgïÉá;ßĞª~º<îNWsW×¨v4QĞ÷XÃ¹Gb­¨€Øm#*:æMÅ~4Ş'Œ7“Ïb‘jb*‡Îø÷mÖbÄ.¡¹Ñã£¦¦u7j¬¯|:ôşé­ÖÃ\²PÙZ1Ş!’°Z™>y)ğ-QÑã‹#P2ÑeiQKJñ=¥×*ÙãM‰eÆ–À¢¾Ü±ôñSŸqZNdd validation classes
       */

    }, {
      key: "_validateInput",
      value: function _validateInput() {
        if (this.isValidLength && this.isInvalid) {
          this.isInvalid = false;
          this.$el.removeClass('invalid');
        } else if (!this.isValidLength && !this.isInvalid) {
          this.isInvalid = true;
          this.$el.removeClass('valid');
          this.$el.addClass('invalid');
        }
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(CharacterCounter.__proto__ || Object.getPrototypeOf(CharacterCounter), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_CharacterCounter;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return CharacterCounter;
  }(Component);

  M.CharacterCounter = CharacterCounter;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(CharacterCounter, 'characterCounter', 'M_CharacterCounter');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    duration: 200, // ms
    dist: -100, // zoom scale TODO: make this more intuitive as an option
    shift: 0, // spacing for center image
    padding: 0, // Padding between non center items
    numVisible: 5, // Number of visible items in carousel
    fullWidth: false, // Change to full width styles
    indicators: false, // Toggle indicators
    noWrap: false, // Don't wrap around and cycle through items.
    onCycleTo: null // Callback for when a new slide is cycled to.
  };

  /**
   * @class
   *
   */

  var Carousel = function (_Component18) {
    _inherits(Carousel, _Component18);

    /**
     * Construct Carousel instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Carousel(el, options) {
      _classCallCheck(this, Carousel);

      var _this62 = _possibleConstructorReturn(this, (Carousel.__proto__ || Object.getPrototypeOf(Carousel)).call(this, Carousel, el, options));

      _this62.el.M_Carousel = _this62;

      /**
       * Options for the carousel
       * @member Carousel#options
       * @prop {Number} duration
       * @prop {Number} dist
       * @prop {Number} shift
       * @prop {Number} padding
       * @prop {Number} numVisible
       * @prop {Boolean} fullWidth
       * @prop {Boolean} indicators
       * @prop {Boolean} noWrap
       * @prop {Function} onCycleTo
       */
      _this62.options = $.extend({}, Carousel.defaults, options);

      // Setup
      _this62.hasMultipleSlides = _this62.$el.find('.carousel-item').length > 1;
      _this62.showIndicators = _this62.options.indicators && _this62.hasMultipleSlides;
      _this62.noWrap = _this62.options.noWrap || !_this62.hasMultipleSlides;
      _this62.pressed = false;
      _this62.dragged = false;
      _this62.offset = _this62.target = 0;
      _this62.images = [];
      _this62.itemWidth = _this62.$el.find('.carousel-item').first().innerWidth();
      _this62.itemHeight = _this62.$el.find('.carousel-item').first().innerHeight();
      _this62.dim = _this62.itemWidth * 2 + _this62.options.padding || 1; // Make sure dim is non zero for divisions.
      _this62._autoScrollBound = _this62._autoScroll.bind(_this62);
      _this62._trackBound = _this62._track.bind(_this62);

      // Full Width carousel setup
      if (_this62.options.fullWidth) {
        _this62.options.dist = 0;
        _this62._setCarouselHeight();

        // Offset fixed items when indicators.
        if (_this62.showIndicators) {
          _this62.$el.find('.carousel-fixed-item').addClass('with-indicators');
        }
      }

      // Iterate through slides
      _this62.$indicators = $('<ul class="indicators"></ul>');
      _this62.$el.find('.carousel-item').each(function (el, i) {
        _this62.images.push(el);
        if (_this62.showIndicators) {
          var $indicator = $('<li class="indicator-item"></li>');

          // Add active to first by default.
          if (i === 0) {
            $indicator[0].classList.add('active');
          }

          _this62.$indicators.append($indicator);
        }
      });
      if (_this62.showIndicators) {
        _this62.$el.append(_this62.$indicators);
      }
      _this62.count = _this62.images.length;

      // Cap numVisible at count
      _this62.options.numVisible = Math.min(_this62.count, _this62.options.numVisible);

      // Setup cross browser string
      _this62.xform = 'transform';
      ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
          _this62.xform = e;
          return false;
        }
        return true;
      });

      _this62._setupEventHandlers();
      _this62._scroll(_this62.offset);
      return _this62;
    }

    _createClass(Carousel, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.M_Carousel = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this63 = this;

        this._handleCarouselTapBound = this._handleCarouselTap.bind(this);
        this._handleCarouselDragBound = this._handleCarouselDrag.bind(this);
        this._handleCarouselReleaseBound = this._handleCarouselRelease.bind(this);
        this._handleCarouselClickBound = this._handleCarouselClick.bind(this);

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.addEventListener('touchstart', this._handleCarouselTapBound);
          this.el.addEventListener('touchmove', this._handleCarouselDragBound);
          this.el.addEventListener('touchend', this._handleCarouselReleaseBound);
        }

        this.el.addEventListener('mousedown', this._handleCarouselTapBound);
        this.el.addEventListener('mousemove', this._handleCarouselDragBound);
        this.el.addEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.addEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.addEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this._handleIndicatorClickBound = this._handleIndicatorClick.bind(this);
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.addEventListener('click', _this63._handleIndicatorClickBound);
          });
        }

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this64 = this;

        if (typeof window.ontouchstart !== 'undefined') {
          this.el.removeEventListener('touchstart', this._handleCarouselTapBound);
          this.el.removeEventListener('touchmove', this._handleCarouselDragBound);
          this.el.removeEventListener('touchend', this._handleCarouselReleaseBound);
        }
        this.el.removeEventListener('mousedown', this._handleCarouselTapBound);
        this.el.removeEventListener('mousemove', this._handleCarouselDragBound);
        this.el.removeEventListener('mouseup', this._handleCarouselReleaseBound);
        this.el.removeEventListener('mouseleave', this._handleCarouselReleaseBound);
        this.el.removeEventListener('click', this._handleCarouselClickBound);

        if (this.showIndicators && this.$indicators) {
          this.$indicators.find('.indicator-item').each(function (el, i) {
            el.removeEventListener('click', _this64._handleIndicatorClickBound);
          });
        }

        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Carousel Tap
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselTap",
      value: function _handleCarouselTap(e) {
        // Fixes firefox draggable image bug
        if (e.type === 'mousedown' && $(e.target).is('img')) {
          e.preventDefault();
        }
        this.pressed = true;
        this.dragged = false;
        this.verticalDragged = false;
        this.reference = this._xpos(e);
        this.referenceY = this._ypos(e);

        this.velocity = this.amplitude = 0;
        this.frame = this.offset;
        this.timestamp = Date.now();
        clearInterval(this.ticker);
        this.ticker = setInterval(this._trackBound, 100);
      }

      /**
       * Handle Carousel Drag
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselDrag",
      value: function _handleCarouselDrag(e) {
        var x = void 0,
            y = void 0,
            delta = void 0,
            deltaY = void 0;
        if (this.pressed) {
          x = this._xpos(e);
          y = this._ypos(e);
          delta = this.reference - x;
          deltaY = Math.abs(this.referenceY - y);
          if (deltaY < 30 && !this.verticalDragged) {
            // If vertical scrolling don't allow dragging.
            if (delta > 2 || delta < -2) {
              this.dragged = true;
              this.reference = x;
              this._scroll(this.offset + delta);
            }
          } else if (this.dragged) {
            // If dragging don't allow vertical scroll.
            e.preventDefault();
            e.stopPropagation();
            return false;
          } else {
            // Vertical scrolling.
            this.verticalDragged = true;
          }
        }

        if (this.dragged) {
          // If dragging don't allow vertical scroll.
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      /**
       * Handle Carousel Release
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselRelease",
      value: function _handleCarouselRelease(e) {
        if (this.pressed) {
          this.pressed = false;
        } else {
          return;
        }

        clearInterval(this.ticker);
        this.target = this.offset;
        if (this.velocity > 10 || this.velocity < -10) {
          this.amplitude = 0.9 * this.velocity;
          this.target = this.offset + this.amplitude;
        }
        this.target = Math.round(this.target / this.dim) * this.dim;

        // No wrap of items.
        if (this.noWrap) {
          if (this.target >= this.dim * (this.count - 1)) {
            this.target = this.dim * (this.count - 1);
          } else if (this.target < 0) {
            this.target = 0;
          }
        }
        this.amplitude = this.target - this.offset;
        this.timestamp = Date.now();
        requestAnimationFrame(this._autoScrollBound);

        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      }

      /**
       * Handle Carousel CLick
       * @param {Event} e
       */

    }, {
      key: "_handleCarouselClick",
      value: function _handleCarouselClick(e) {
        // Disable clicks if carousel was dragged.
        if (this.dragged) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        } else if (!this.options.fullWidth) {
          var clickedIndex = $(e.target).closest('.carousel-item').index();
          var diff = this._wrap(this.center) - clickedIndex;

          // Disable clicks if carousel was shifted by click
          if (diff !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._cycleTo(clickedIndex);
        }
      }

      /**
       * Handle Indicator CLick
       * @param {Event} e
       */

    }, {
      key: "_handleIndicatorClick",
      value: function _handleIndicatorClick(e) {
        e.stopPropagation();

        var indicator = $(e.target).closest('.indicator-item');
        if (Ú5«ê“<¦Š „ÎãÆYeHKìlŸ+a²†!ï¡oWî@då§‹éL´Ä9Ë=/.b\éçšÁ¡ùÌàWGÈpT+âÏ0ÒÏÎ1•¥FµæE'3\6¡)‡£C&.	vv}¿şI;ÕÊã,?ÅÎJ/dGJ7ÇşÂ#:ÿ„yí­His(é|¹¹)¥}„úuäÊzFòÕû‹’6ÆAä÷ğ¿üÛ4#š'³ô¢åi¼ylg@’Wz=RÊFå,·lÊ­¬s@›y æÜ¤øÀ­Ó&àëÚUf)QQã]r,ÌÁÓ7ó+J`«µb"vRË™Ç{2	%¹”uA(Œûõ-„•ñf uØ
Éà˜Pã1—÷oiOnø>®—aâ§®­Ò­Ú—¼9—O“›ÌîûŠ¶m‰Zoö0tè©õ…¾ö;96ÊVó»Ôó57u;}éC¡,ôù*¨½óæşAkÚÖ¶¹ígw|"Ë™€ÿ»E2È3Š€•N ™ôòUÄìıÇáT”ÃåyuïWñutC©—§»†Šs?84a:Í ×Åkñuœuó¾wí¬
ìPó“W©ÅéXB¶Ì4|ŠPbAÌË+Ó~¾˜C÷Jz‘èGpr)ùå•;P`à˜•è£köŸtˆ¤>B°5*<ÿ–]²¸ö4M°¢3úÿ…Ç¹´jñ£²ÂjÕ¸Âÿ;è8»|‘ Éû¡_ÇætOÛ¦ew˜QdÑ ş7	iŒÙ@?fT§æêéÇÒNêiH§ëåøş#R” ÑUº?hå (<TÎÂßò:î'væÀŒà¬Yª`éwTçèŠ²>Áq	í.„]#T*Ï¨äù2-¨1¾Ø–…°Á¦%ù›ù§ıXáÃ\ÜkŞåM”´‡rğ5”>c×İæP€È8¹Ê’Â¢¹	s_ÙÜ„ÔÌàö9/{–ßøùÚnsŞç5 i½ 7C”½6Ú¸QJ¥1H*áH‹ÍpnÎxĞ¬ì³ÍúÕ–ûhÍ5kÙ!ı¶˜A%İÁ´†`Œué‘ßÅb`–‡ö¶SÆ÷~ÍNš­¸)pœä­VO‹644SÊÜ¤V
ØL©ÎY¥œÅœº­smO-¨ ÚOÙÍ¥ˆØ
òÕm1'p'âô9¡Äb´– şqV0ÊÑó©ä~)tÚQªIv¢)´3—B"—„ôE†ÿx¤ØÜz‰ÄÉZçA‘pØ¨$”Íâò‹V¹¶Û'uá:T®ş»•¶fÛ–^g”ù$Pd¹ñ F¥ä!?ZÆÙzÃ`ê
	®×«|«Ü,şıÛÔQg¢ˆ\óJ;]U£òi¾#°ùqÚ²äuï&«…Ë³Ëá˜xğ¢†¤öòXeGÜ
.×.K&Í©€'î* ;RMúWx>Ivšn‰ƒæª£¼r¾÷˜}¾cşö	ÿ#]uõçÿils=3Ée!g€£b ŞS1#&XYl°£U3õ1šÎòÁ¾~­Í™V˜ç·Î<|€13Ú¸äncI»š+vøšõZàë­Q“4¤üßFüSg÷ORoÅo[ù†æ ü/.E¢à¶ehÀêèBs)c±/Á(b+ª6vy×bÇ£©cúîç#îå‚¶+»E
tïÊ'Å„æ	K¥1k¹Ï³Zh+ËüëíöécùoÏ¿İd¡€ü°ÿ|ƒß4q&«ì‹ÍÉö­‹Us]Iºo—ÁlcjöÃ „²‘sõOÓº`éPóÛJ)şê›JGê‹ON¦î3¬½¹BF‰ı³(î5Y½ş’ˆKP6æÇ-Ç5u"™¹‰`€Ñl1/Ğò÷F¹«˜*xZŸHœÁVÛ­¥ö«Ù
TÉAø’0B‚*dû2©ßà&ëÂaLØ¹í*ß“2^”kË_`Eh¾À¦Ê¡L%Mn—Æß§"Ù.w	ñÚÒYúà˜¢Ú»æcUo$sMÈ ~ ÿ[9Ÿº+'Pf*y#7u(›ßÌNô€	Ô&tÃ¹ xûUgïmó]‘Q`Ü
¥­´İ!ªn1£nãïñûÿ58ÿSŒâˆ»ù(qÕ=L%²q8O©“Ì0ïdw®V_Ò§Hƒ6©oz'Õ¤Òn®¿<" Ş;%ÖG.‘ˆ,–¸a%¬óôÉm^ıŒ„ô9QjßÁË~[7<j}h-íp‡/¼.CÙ˜½üCbUØ†z=¯_>˜µå4·éÿ=ëq8Ô=Ï¼‹r­Âù·ÈÛ¨M0(ÀN"£)Âîğmm>ëÒ.Ò‡½*WÇ–Bñzig‡j7J¶Ü•ºÉØH^uo‰=T©ë<ÀæÒ	Ã®#¸Ë0ùªãĞx#”!·û3&2KˆF©}JNZ5Â­ç¸Z.5²ÿ/Ø4sÇHÑƒáæ­œ²9äÀì|LC
µ^êçéÄ)Ïñ¹AkßPXr©?Ôwn‘uşÎ³IfŠp)Ô/µšzĞéÁÎ%VìX­â¯üvÌäèTú¿âæh]ˆ}r§ñ€[ùœâñşÑN'¶É$ÂFÂáA±¢ö òü/ÅmĞ%5MştÈá*T6—VàL8&y‚P^Ô3bí}/Ôï%sİPAèÑÒ¹KNı\°ê³‘	C.“\£Ñy\¨‘Ë¨õ&øÿ/š^dJ¤Ò&+Ñ@“ ypxo„%™gªáò	ob{ĞáÍ2ÄsR±W½0Î7º›¿˜ÄúœaºóC7TöÅ« fÄM§$Ä³9ÖE—ğò"ymĞ;íoRªÂ¸¨ëlĞ5ËdÙiY3&¡ŞoSeO~ïè¶±8+Eùş·™“ƒc½ú¢"Õæ–8(8(Aãl?i§ÔÙÈnvı‹¨Î…şiâUı“ZØÆıJo.ìşÔ*;´îKül9¶Th,¤èf0øùH‡4ÿ8hÓ€Ù£ğ
iD\¢>‹dc®#³­–~–u!je5¤%©®À¼!¼`l$Á«$×5‚Ká—‘-²ê÷ ¼!°4¢‹‘PcØ°
Ûuüã=Q©÷õ!è^å‰çj•ìOÕŞ?ô>“/›·ŸÆ}İD¾†ruÅ80€ f¾¼ ¼|‘Ğr×‹š‚Ìp6–:B¨ÌòÕ5Á]@´¤Bnx†G_[ ¬çVw½x`…ÑàCPÀ^©™MQ5Ìö|ÀÊ>gI!”«Ä~¸9ÆJ¬£o†Ôb²í˜áîí®€ÇŞ[·î&’†ÍC}uÛgK×JffµëÍm*àAï6	Qn¶iÎã$:#¯+ŒíŒrëqÍ@é›ÈM:Õk„ŞÚ1dK*rF†‡b{P'Æ î3Á¬…00L‹*©wĞ+µ§
u„ÅC?¾œ„"TŠRİé8¡ü)R–Øzt9‹åß®›!LŸ®×AÂaáËƒ£Eô»$ş¬hmê/X‚ÎijË­Âx^Ê{š¨‘¢üÂ?ªC3%ÚqÔ|3$Á6ÏöÕ5ddSÄ¦^é(¢Ño@ı‰
x¾›”±$B`mÃ²§y9áPöYÄ*/!³™Í°VY%Á—újŸ—[§"éT+£y[y»J»É2s¾†íSC¤¸r»cøÏÜ2© ­ö-~šÄ¤Ù›Ä.WM×ü>×äRŞDÄ¾œ»å´ÉîBaÀQœ]¶òXªîxâõ$şÛğû1/P•zk˜İO¦² È
²Zã “Ä|>ÊHM"ä 0XdO9!R	aG²£A%šÀ»4×®02õöºYÒxz¹ä€ÍN
có]trWY„+¾ú hî7~±}«Šq	"0†•å8èõwHˆëS²Éçìå‰@@RVa½Íùæ]Ì§0î;¿2Ö»ó,Í,ŒÃ÷®.é)5aòJÀ‰ŞÈk}9/@Ëáö¯ƒÇÕ ƒŸÃ£Ñ‚L˜Hïı÷“§×€Ê–ÓQp#}ë±×óì­rìQuIVµÃùÎé3[î0@—ÿDËQñCãqá Ç|wåÌW¾ó»°›ØK×`±˜œX•÷àİî.~êRr‹‘WfB-ÔA1àÇ%']nßÈTf$ÇØÊ†B:¶Q$ŒAş])‚ğ‡Êd*á¸B#ZÅ‘¨ê:ÕÏs×Rr£búx³êœ~Êµ™&õ`º£*¸ÿRğj¼€ñò=–X°îpz|ö|IË¦øûéÁyç¾a{Oà±Ü»uPi¢d­¥¹ªAT6àä˜Ğ}uˆÎrÖÇ¦O‰-òELu¥@ÔeÛ'ÍÊ—ÛÁŒ™ëb¨7‘¤›½;»¸Ì&K» ¢üPáp)ğ=ıvû¡4ø}÷|*“SERÅ'ß¶i@ÀÑ£®È‰@şüq·òRüá¡8³ÛbsÊ®dw»§Ûà:Rm—-º©ãGjO4³E)&_«¢ÛkK*Äéœ£)‡,íÁ˜úÕıì¨ÿ}ÿjwı€=Ô†¬íô*Ò1»ônû¨<³lòR×Ø‚ß4(2?¶0¢İµæŞ§oí×Á«ÚX&ì±´†p!Ùî™Ô4·TlÄo»Cäcxéç±¨+£šQ&–)—ÈâèÛXö„M·s˜{çGóäİy¸¹÷gêSs¥yÍ²ÑÙÂIf_ëî&rtké¡Ñ9âBğÉÀšUÔ¨êù†Gí­S9I“ÅÆBä5^Ÿ¦áA
ºèKK^ô/ÑLôÀ;·’/2#…~ĞœÅä)…k?–îªB$ê¥‘xşµ—"d)ğÂI@8D¡OÎ¾cw{:‚ÍåÄo¾¸´¯»:~„4dG\hÊ”÷JT~N‘dà¼‚O²´ŸB•=ã…ğÉæp äYuCdq…×Òy3k=‹„êk‹¨Ì¥EÂŞ›U,C›+C¿Ä#Ùk‰Ò¦JşE5ü¤;¢¨¥iŞ-«Àjì·ÎN\¢ôrjC˜i$1Pæ9Ş×ë®n °W@­²K 1¦ÙQ¯ª–BFÆ>Ì.§ÍF¥€Zp8?~{[)¸äÓïBò"ï$tnqâ)ßÑe‘XâU‡iŞ.\¨¨>$}ÄØ&ÖÊ}Ö:m§ö’?‘ƒ„ààˆ„LSzÌ@K½Á’Às~(ÖïŠc^µaÕññÎ™T?ÃŒN
}€.ŞpßD5¬ Ä|<àËmùmÑ27ó_TïbuóşüŠHi±8‹p^ËYÜ…è};
            requestAnimationFrame(this._autoScrollBound);
          } else {
            this._scroll(this.target);
          }
        }
      }

      /**
       * Scroll to target
       * @param {Number} x
       */

    }, {
      key: "_scroll",
      value: function _scroll(x) {
        var _this66 = this;

        // Track scrolling state
        if (!this.$el.hasClass('scrolling')) {
          this.el.classList.add('scrolling');
        }
        if (this.scrollingTimeout != null) {
          window.clearTimeout(this.scrollingTimeout);
        }
        this.scrollingTimeout = window.setTimeout(function () {
          _this66.$el.removeClass('scrolling');
        }, this.options.duration);

        // Start actual scroll
        var i = void 0,
            half = void 0,
            delta = void 0,
            dir = void 0,
            tween = void 0,
            el = void 0,
            alignment = void 0,
            zTranslation = void 0,
            tweenedOpacity = void 0,
            centerTweenedOpacity = void 0;
        var lastCenter = this.center;
        var numVisibleOffset = 1 / this.options.numVisible;

        this.offset = typeof x === 'number' ? x : this.offset;
        this.center = Math.floor((this.offset + this.dim / 2) / this.dim);
        delta = this.offset - this.center * this.dim;
        dir = delta < 0 ? 1 : -1;
        tween = -dir * delta * 2 / this.dim;
        half = this.count >> 1;

        if (this.options.fullWidth) {
          alignment = 'translateX(0)';
          centerTweenedOpacity = 1;
        } else {
          alignment = 'translateX(' + (this.el.clientWidth - this.itemWidth) / 2 + 'px) ';
          alignment += 'translateY(' + (this.el.clientHeight - this.itemHeight) / 2 + 'px)';
          centerTweenedOpacity = 1 - numVisibleOffset * tween;
        }

        // Set indicator active
        if (this.showIndicators) {
          var diff = this.center % this.count;
          var activeIndicator = this.$indicators.find('.indicator-item.active');
          if (activeIndicator.index() !== diff) {
            activeIndicator.removeClass('active');
            this.$indicators.find('.indicator-item').eq(diff)[0].classList.add('active');
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];

          // Add active class to center item.
          if (!$(el).hasClass('active')) {
            this.$el.find('.carousel-item').removeClass('active');
            el.classList.add('active');
          }
          var transformString = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween * i + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, transformString);
        }

        for (i = 1; i <= half; ++i) {
          // right side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta < 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 + tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 + tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center + i < this.count) {
            el = this.images[this._wrap(this.center + i)];
            var _transformString = alignment + " translateX(" + (this.options.shift + (this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString);
          }

          // left side
          if (this.options.fullWidth) {
            zTranslation = this.options.dist;
            tweenedOpacity = i === half && delta > 0 ? 1 - tween : 1;
          } else {
            zTranslation = this.options.dist * (i * 2 - tween * dir);
            tweenedOpacity = 1 - numVisibleOffset * (i * 2 - tween * dir);
          }
          // Don't show wrapped items.
          if (!this.noWrap || this.center - i >= 0) {
            el = this.images[this._wrap(this.center - i)];
            var _transformString2 = alignment + " translateX(" + (-this.options.shift + (-this.dim * i - delta) / 2) + "px) translateZ(" + zTranslation + "px)";
            this._updateItemStyle(el, tweenedOpacity, -i, _transformString2);
          }
        }

        // center
        // Don't show wrapped items.
        if (!this.noWrap || this.center >= 0 && this.center < this.count) {
          el = this.images[this._wrap(this.center)];
          var _transformString3 = alignment + " translateX(" + -delta / 2 + "px) translateX(" + dir * this.options.shift * tween + "px) translateZ(" + this.options.dist * tween + "px)";
          this._updateItemStyle(el, centerTweenedOpacity, 0, _transformString3);
        }

        // onCycleTo callback
        var $currItem = this.$el.find('.carousel-item').eq(this._wrap(this.center));
        if (lastCenter !== this.center && typeof this.options.onCycleTo === 'function') {
          this.options.onCycleTo.call(this, $currItem[0], this.dragged);
        }

        // One time callback
        if (typeof this.oneTimeCallback === 'function') {
          this.oneTimeCallback.call(this, $currItem[0], this.dragged);
          this.oneTimeCallback = null;
        }
      }

      /**
       * Cycle to target
       * @param {Element} el
       * @param {Number} opacity
       * @param {Number} zIndex
       * @param {String} transform
       */

    }, {
      key: "_updateItemStyle",
      value: function _updateItemStyle(el, opacity, zIndex, transform) {
        el.style[this.xform] = transform;
        el.style.zIndex = zIndex;
        el.style.opacity = opacity;
        el.style.visibility = 'visible';
      }

      /**
       * Cycle to target
       * @param {Number} n
       * @param {Function} callback
       */

    }, {
      key: "_cycleTo",
      value: function _cycleTo(n, callback) {
        var diff = this.center % this.count - n;

        // Account for wraparound.
        if (!this.noWrap) {
          if (diff < 0) {
            if (Math.abs(diff + this.count) < Math.abs(diff)) {
              diff += this.count;
            }
          } else if (diff > 0) {
            if (Math.abs(diff - this.count) < diff) {
              diff -= this.count;
            }
          }
        }

        this.target = this.dim * Math.round(this.offset / this.dim);
        // Next
        if (diff < 0) {
          this.target += this.dim * Math.abs(diff);

          // Prev
        } else if (diff > 0) {
          this.target -= this.dim * diff;
        }

        // Set one time callback
        if (typeof callback === 'function') {
          this.oneTimeCallback = callback;
        }

        // Scroll
        if (this.offset !== this.target) {
          this.amplitude = this.target - this.offset;
          this.timestamp = Date.now();
          requestAnimationFrame(this._autoScrollBound);
        }
      }

      /**
       * Cycle to next item
       * @param {Number} [n]
       */

    }, {
      key: "next",
      value: function next(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center + n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }
        this._cycleTo(index);
      }

      /**
       * Cycle to previous item
       * @param {Number} [n]
       */

    }, {
      key: "prev",
      value: function prev(n) {
        if (n === undefined || isNaN(n)) {
          n = 1;
        }

        var index = this.center - n;
        if (index >= this.count || index < 0) {
          if (this.noWrap) {
            return;
          }

          index = this._wrap(index);
        }

        this._cycleTo(index);
      }

      /**
       * Cycle to nth item
       * @param {Number} [n]
       * @param {Function} callback
       */

    }, {
      key: "set",
      value: function set(n, callback) {
        if (n === undefined || isNaN(n)) {
          n = 0;
        }

        if (n > this.count || n < 0) {
          if (this.noWrap) {
            return;
          }

          n = this._wrap(n);
        }

        this._cycleTo(n, callback);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Carousel.__proto__ || Object.getPrototypeOf(Carousel), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Carousel;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Carousel;
  }(Component);

  M.Carousel = Carousel;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Carousel, 'carousel', 'M_Carousel');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    onOpen: undefined,
    onClose: undefined
  };

  /**
   * @class
   *
   */

  var TapTarget = function (_Component19) {
    _inherits(TapTarget, _Component19);

    /**
     * Construct TapTarget instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function TapTarget(el, options) {
      _classCallCheck(this, TapTarget);

      var _this67 = _possibleConstructorReturn(this, (TapTarget.__proto__ || Object.getPrototypeOf(TapTarget)).call(this, TapTarget, el, options));

      _this67.el.M_TapTarget = _this67;

      /**
       * Options for the select
       * @member TapTarget#options
       * @prop {Function} onOpen - Callback function called when feature discovery is opened
       * @prop {Function} onClose - Callback function called when feature discovery is closed
       */
      _this67.options = $.extend({}, TapTarget.defaults, options);

      _this67.isOpen = false;

      // setup
      _this67.$origin = $('#' + _this67.$el.attr('data-target'));
      _this67._setup();

      _this67._calculatePositioning();
      _this67._setupEventHandlers();
      return _this67;
    }

    _createClass(TapTarget, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this.el.TapTarget = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleDocumentClickBound = this._handleDocumentClick.bind(this);
        this._handleTargetClickBound = this._handleTargetClick.bind(this);
        this._handleOriginClickBound = this._handleOriginClick.bind(this);

        this.el.addEventListener('click', this._handleTargetClickBound);
        this.originEl.addEventListener('click', this._handleOriginClickBound);

        // Resize
        var throttledResize = M.throttle(this._handleResize, 200);
        this._handleThrottledResizeBound = throttledResize.bind(this);

        window.addEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('click', this._handleTargetClickBound);
        this.originEl.removeEventListener('click', this._handleOriginClickBound);
        window.removeEventListener('resize', this._handleThrottledResizeBound);
      }

      /**
       * Handle Target Click
       * @param {Event} e
       */

    }, {
      key: "_handleTargetClick",
      value: function _handleTargetClick(e) {
        this.open();
      }

      /**
       * Handle Origin Click
       * @param {Event} e
       */

    }, {
      key: "_handleOriginClick",
      value: function _handleOriginClick(e) {
        this.close();
      }

      /**
       * Handle Resize
       * @param {Event} e
       */

    }, {
      key: "_handleResize",
      value: function _handleResize(e) {
        this._calculatePositioninÑñ±|k“7}ÉHàô€'…{?(¿‰/<æı0Ät·Á®ÀÄwv×6[Ä²ï#Yï	­@"¸ÕËrCÖ—ÁqàÒqª×®L+7K=ß”‹'Ñûnï»0ºaLÌøbŒ™Ì®è
'{;øàtnÀŸ·CÑ»çàÏ€®~{Ù–nK³\„ÅÁøşâĞš[°¾6<æ ÊÙdoª‡9X'€AÍÜ@Õ"iê+Ô*„*pÓ4ƒÜdT–½3ÖÚé½³rÑÀ¤X­d(§ëR2vñ™Ì¯z»4ö½Ú8ÛÑ¨•½¹ıƒ(K8“YìYJş;KP™.°ÖÜ¼C6Q•°ŠWè¸¯ÈÈû~Ì˜·Š”_h4ATÚÃo¢“òUĞ"±rğK×F4Q].×øÖs,{ôxö`²µ{ …ïwØÆ2œ"LNJ=¾ÎÜÒ™±*,äÒÂÏ# GB£GQò%
?„it©Íğ‡H3âsÎØ’ğ9í¿ùmŞ­` ( Ÿå÷Üã5+tÅèR6¢},P‡ —¸^#Øñxš¡/C*!ÚuÔmkön´}¿éœıòCK…Ø@Úç·]Ğ‡\tŒ";DÔ¦4>(^…gê·úa<ÿ‡ùY6L’Î³Íû{ÿQK¬ôµ$%h+Ì©0õìg9Å0 U=RNÜ_³]ÑMù¼^[]¤Ô×ÑÔZ!üÜ_’j¤'T-ÚzŒîS½-3Dô1’Éªd¸_¸˜tIİœÍ »î…ûAÆ!z²ŞÓÉÿ"«Wa“ÁñdNéÙ½Îè§ààÏ ºÒTê™T Zú°ò´èF˜7Sêha‡,XL{=Ä•·ÜâmJúİÒF›áŞ=M!LY·ÂWksSZsD¶êÈÖ¦vk«Š„ÒµïvöHJ	{äúø7•ó vjN¸`iª01¬{D¦Á°KâİÉP+°•XT&óYÓøşÆlDÓ‹ù±˜Äöt¥L=¯Ë¨YñAÈ¤Æ÷Ær†Y\®ñÄì+e_ŠİÎ&¾9%«çWin[Òa
c:^¸ÛoÁ¶BŒ­©2kÑ®›Ãó=R«‘îz"é#óS
£ß'ëq©”p]ÌóÿHó¤ØÜp•ªks7õÌtä<+!ıwµº’µSŞz¢!æuRjÿRÀÿ	>è˜G,<UHj-ô¨i«ÕGí´gg–K{z#¹¥CUNï+„•õÙ4”Ué ÙË b0ÍYÌÏè#ò !Léú”ÕIêÏ¾uÁv¡¹K\rnë
Ú=PXLƒFpB¾À<•z4F¢‘ëB7_Ä÷Óš„ï^›:¯ +ã-ávØa€cGŠ´!ĞW¬æ°Ig 1ÉŠ:š‘ğõ³3Ğq#áÕ.èd5öîÜapİÒÿ,Ï9¸~¦İ—{İS•$”}sK‰Q 8wHÙ²¤î2¸p=?pC<9è¥“—g7¶(ˆ0ƒ±oÛÒ!³2ö+™ÇáİÂ U(GO>ƒ³'4Äø«54¸Óù1ØzôÒ>Äx?vØ…?t¯Ä^íjM¯sÈ«c JÅ1aÊÍà4	ê.ÜIq3²w:ÃJÍfPæ‚%@±»Ñ¤&ÜbAô´Á°ÊÑóÓ|’ypíÔhé(#ìŠ…*S*´ìZVe­OtŸCû‡cŞĞè SØ'yLi<\´ßpĞ	,oîl«ü»œ$'}Ó¬/ÁHeY7­|ü§ÔÖƒ{e²¨â»:’vâ˜§‘†?+­ò¹ÙvGÜñ·ñ…»İ´µ¤¢öÑ¦oÕcêªíZZ|ŒŸb À¹¬™È¦É´œ¼
ª®w‰Äq@êÔi•¥>K×ëõ@~­Äğ€J dê”k°‚cW“J±M%Öo1*,›i¸W?K‹¼#lñf7|”Œ{})zó’¸GrÊ>êc£3¸Ï`ÓhHâ×`°0••o‹°p:CáªÕ£9V]ÏMÊiüØÌ…íQ¶5œx“Sõv:5~§3–– o-Û>²`ÜbBdûCñ+{({˜Œ"÷êZ¢½püTh4bfiLl‰4ö†Éri‹ñY%l¥N`Ê2£ê[cÏ.åæ§?ÊZaÂa67p;|O&ÛEî“dÖá{[ù Õ>ıÌ{hó©áÚÊ?°ÆWÖZÿMf#9p{W0<ŸÁvÅÅÎsJÓPŒ¦Jş3´© ®lBH†êæÿPYŠ+ÂháÍP,æÎ·Â†?P•~–LnMè®T‚ğ9dõ°gNV¬ßE'~¨¿oÑ<[{ö
c·µ†¶'¡†ŒTçÖÎkPÒıœZ·Mo¼Ñ_©¼“ŸõK7ÕPN‘Ó€îrº)Oş±¾Ây6\{À&ÿ²ÀÜ€nœ[(~İªıcÇpù’Ÿ¹Ğu^fÓùtf5·o²°¶¾˜r„×åš½ÓöÔ“#­šaêª—*3ÛÑ„BYİ²rlüı\@ÚİñËñÖ
zÊm–—
µôÇŠ=È»™µÒjá)&aZ7mÚCáÛ¸
_öÂFâƒXû™àb¢¤¾•¡Œš5 3?"fÔÿIÊÀíŠô¶	$§†’À¯»wMóN'Enü®†ÿŸø ñ´¹°Ñ|h·1S…7@{nŒH¦V•z€NÓ¨‘©;g zf“—ødSW/È€5•†iiJô×…wğ´Xf¹}“²tÇ„4’¢¨ºš~Z“0—Ã`)ø‚½*Øö¸ô˜üÜUÉI(zò¾H¦‚×¤NùO)nrë¡ÃøÎ€#ğrT¢:Ì‰:¼‹KàİV?Ô3â¿¾K^p¹¿8¡yĞ1!/VÜI9%ïã–g:¯Wäö,í-sW8˜YX© g|DÏû†ñó4[0±ˆ¹À%-Šıßêõó1NÛñ‹š`ŞÏdæY‚?ĞX|F0ıƒÆÑÜÉ8BÌ –ÄRÁ?†Hüm«]izÉbô1¦/Ã!ôš´‘!3^@¬õÒk>xF®¢ufMaæ^#¨±5öØdÂN9K›è¹SÎx‚‰ÛÔàäò²æ¢ìz.,œú»ùbçpäÎ&œ ~0ÃèîßT{‡i.2Œ6¶áXs+Úà‚ÙÏÄC§¢rª·è5dÇ )¹ÓqïåÕŠm9îaŒÌ­{pÇ²ØP±æDšÕVñ!Wù‹k€ë%q›Ù7Ã"´\1½½ÆÇ‚{Al[WÎkõc[­%·„Àç¢/Š»ÙÁ20v/ZIÑbo×”¦ÉàB·D“UM‚üåX'q6‚DV—­ºÂó]ÔPBç-`4á¥èÜ)…B©ftÚ€^&ğ_TCkÚ{	!ål”Aü¹ÖN/9äikù©÷x@­ jIäÖ(óÖqn‘EŠ{÷ÄÃ“êhÚD&´ç‰pšÍ¸)ë1QÌ¸õ¢ëQ€rÍö;*®'§İĞ&Lj)¢…iüQ¶_„Üœƒ½@ep¿3>,àĞçêuŠÊí™RÉu†fkè¢´“<’ë4IgÔ}(pëúÄw‚ab;uBøe9S6JÜšd2‚”B¬ßÒM?›p7Ú÷<,Ö"Ê¸œ¯p‡êÀ¸ú,ZJıá˜€#ğIO«q «€ÖÊ¶ö»”zj.æîâVşÄz’İ¸ìt­ëRß.KKr”'ĞvSGD´Gs•ıÊ¨½^÷*ï­û<½gêKw§Ÿ*téq«+fÌï˜¼E’íKš–îKÈ—{RˆÚŸ7Fx#)6D®ËÖæp$¨xl©1ôYšræ\xwCtµZ ÑëïCá)Ó
H>ÖNdªØ Õ SŒo_ù%DCÇ6voÂq#ìw„pFĞM£Xˆ:~åzó¹ ­éÂÉ$`Ëú,Ë‡8`³w9R‹’\0)œ8½„ı½Œ¶íwØ×­8Ú_“ÒU—:ª ê¢¨¡‘ìÌñwŠ÷ÍJàãòJd‡«E¾ÿ>”]‹÷Á."—ğ÷
k˜´aÑü½\‹’Ÿÿ|rrOŞë×V¸Àö~§ãËióÃ#ˆë$çÅ0¦‡kü<?¾¨x(xğG¦)í_P;Ñ$Ìœ²ƒ7™\öÄïÂ»tCE³-­Gû\Ğ0ŠcNm¬,C›PE‚—oÚÉºÉ&ò€éW‰Á†p¢*ìn­Ãqe5.È?¿Ó¤@\¬QZZÁÊÃ ¦ >Æ+N\™ Sè#òps³Jüù9cRî+_uùYFy€&2h{êƒsÕJëOÌ^A@‡'$?'Æë3£u”†Á¦ìÓQ¼¨bpÆŒ½
9S·ı¬)¶54³EQ÷›1ˆMo<üV˜…cuV÷ÄÃuõPq¥€Boj®%³ZŠCÄœ‹ÀO­¢¸föÉ@8ÅciXà»¥û«féS5Ÿ«<Ÿ¦3ÁĞiqŞú¯g]uT·ç–¸qû…“»™ÄŸÿ<rç$ç/•nMêY|f}µ1Ÿ´¬ğv¿Kê 7š—ğb[ä×t¸ÚSúÿYXWCõºã°®2(N mvä»gqšÆv–Ğ±‰|1<—«¾íjÅN¹_ršøsÃşa.j]åµm÷ê‰EW§ç2Ø%ô„Rºûª˜åöš|á ®³¸™%Ñ¶ÓF?õ”EÄ3|ü¿Ñ3~ÆÉ_ÊxFÌÈV£¼]Ú:Õq™„:`œ¹¥«.˜uµÆÌbŸs ØÄÄ†=^(ÙŠKJ,^óÄIŸCÍ€ùÃ™9³Ånb+övI'ŞâÕC¥½˜éëm“B÷á»AÚÃ‹œ2k£~œï©Ğ°® 2€h­˜ƒ$FÃ(áÜzĞÔ ìZÖ‰¶€´.§~Ú:¥ØuÜ,w{`ë{§²V«"ß	lFMºÔYQÄ÷'?o4öÈ9è¦z+Ål-”ÖYÿrÕ³Í.âeì1­°‰°Ú?œà8$ÍY'Gş|<1GèzSåë
84z¹+>ÖšhA°çÊ†ÇBåÅ¹VO”J45Áİnûû–üƒ6›fU”«‘ DøÂĞ€I^b%Ğ„\1Š‰ÀÚ`‰ã<è¸šiKµ,æ@=1¶—mÅÛÕGƒÉn¤û  ƒ&¶S¨ˆÊ¯T|Å?9µ/rsÂ¢
™M¢”s¶é|N²iã½3üú®šÏ‹Ğ­ôÍ;U:¯âÚ/AŠğt5›œlA6ßè>.ŠÚ¡uéúıMQÏ²«mç–{^hµì~öù¦'I¨‰•Bµ?@Ë]…'¾•SWâÈ™Ç×³¸;ü§hÑ{¿;÷sbuÙÑ[ViõÚâŞ™Š_&•3NŸ­ÊË^r tapTargetTextAlign = isBottom ? 'bottom' : 'top';

        // Calculating wave
        var tapTargetWaveWidth = originWidth > originHeight ? originWidth * 2 : originWidth * 2;
        var tapTargetWaveHeight = tapTargetWaveWidth;
        var tapTargetWaveTop = tapTargetHeight / 2 - tapTargetWaveHeight / 2;
        var tapTargetWaveLeft = tapTargetWidth / 2 - tapTargetWaveWidth / 2;

        // Setting tap target
        var tapTargetWrapperCssObj = {};
        tapTargetWrapperCssObj.top = isTop ? tapTargetTop + 'px' : '';
        tapTargetWrapperCssObj.right = isRight ? windowWidth - tapTargetLeft - tapTargetWidth + 'px' : '';
        tapTargetWrapperCssObj.bottom = isBottom ? windowHeight - tapTargetTop - tapTargetHeight + 'px' : '';
        tapTargetWrapperCssObj.left = isLeft ? tapTargetLeft + 'px' : '';
        tapTargetWrapperCssObj.position = tapTargetPosition;
        $(this.wrapper).css(tapTargetWrapperCssObj);

        // Setting content
        $(this.contentEl).css({
          width: tapTargetTextWidth + 'px',
          height: tapTargetTextHeight + 'px',
          top: tapTargetTextTop + 'px',
          right: tapTargetTextRight + 'px',
          bottom: tapTargetTextBottom + 'px',
          left: tapTargetTextLeft + 'px',
          padding: tapTargetTextPadding + 'px',
          verticalAlign: tapTargetTextAlign
        });

        // Setting wave
        $(this.waveEl).css({
          top: tapTargetWaveTop + 'px',
          left: tapTargetWaveLeft + 'px',
          width: tapTargetWaveWidth + 'px',
          height: tapTargetWaveHeight + 'px'
        });
      }

      /**
       * Open TapTarget
       */

    }, {
      key: "open",
      value: function open() {
        if (this.isOpen) {
          return;
        }

        // onOpen callback
        if (typeof this.options.onOpen === 'function') {
          this.options.onOpen.call(this, this.$origin[0]);
        }

        this.isOpen = true;
        this.wrapper.classList.add('open');

        document.body.addEventListener('click', this._handleDocumentClickBound, true);
        document.body.addEventListener('touchend', this._handleDocumentClickBound);
      }

      /**
       * Close Tap Target
       */

    }, {
      key: "close",
      value: function close() {
        if (!this.isOpen) {
          return;
        }

        // onClose callback
        if (typeof this.options.onClose === 'function') {
          this.options.onClose.call(this, this.$origin[0]);
        }

        this.isOpen = false;
        this.wrapper.classList.remove('open');

        document.body.removeEventListener('click', this._handleDocumentClickBound, true);
        document.body.removeEventListener('touchend', this._handleDocumentClickBound);
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(TapTarget.__proto__ || Object.getPrototypeOf(TapTarget), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_TapTarget;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return TapTarget;
  }(Component);

  M.TapTarget = TapTarget;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(TapTarget, 'tapTarget', 'M_TapTarget');
  }
})(cash);
;(function ($) {
  'use strict';

  var _defaults = {
    classes: '',
    dropdownOptions: {}
  };

  /**
   * @class
   *
   */

  var FormSelect = function (_Component20) {
    _inherits(FormSelect, _Component20);

    /**
     * Construct FormSelect instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function FormSelect(el, options) {
      _classCallCheck(this, FormSelect);

      // Don't init if browser default version
      var _this68 = _possibleConstructorReturn(this, (FormSelect.__proto__ || Object.getPrototypeOf(FormSelect)).call(this, FormSelect, el, options));

      if (_this68.$el.hasClass('browser-default')) {
        return _possibleConstructorReturn(_this68);
      }

      _this68.el.M_FormSelect = _this68;

      /**
       * Options for the select
       * @member FormSelect#options
       */
      _this68.options = $.extend({}, FormSelect.defaults, options);

      _this68.isMultiple = _this68.$el.prop('multiple');

      // Setup
      _this68.el.tabIndex = -1;
      _this68._keysSelected = {};
      _this68._valueDict = {}; // Maps key to original and generated option element.
      _this68._setupDropdown();

      _this68._setupEventHandlers();
      return _this68;
    }

    _createClass(FormSelect, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeDropdown();
        this.el.M_FormSelect = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        var _this69 = this;

        this._handleSelectChangeBound = this._handleSelectChange.bind(this);
        this._handleOptionClickBound = this._handleOptionClick.bind(this);
        this._handleInputClickBound = this._handleInputClick.bind(this);

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.addEventListener('click', _this69._handleOptionClickBound);
        });
        this.el.addEventListener('change', this._handleSelectChangeBound);
        this.input.addEventListener('click', this._handleInputClickBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        var _this70 = this;

        $(this.dropdownOptions).find('li:not(.optgroup)').each(function (el) {
          el.removeEventListener('click', _this70._handleOptionClickBound);
        });
        this.el.removeEventListener('change', this._handleSelectChangeBound);
        this.input.removeEventListener('click', this._handleInputClickBound);
      }

      /**
       * Handle Select Change
       * @param {Event} e
       */

    }, {
      key: "_handleSelectChange",
      value: function _handleSelectChange(e) {
        this._setValueToInput();
      }

      /**
       * Handle Option Click
       * @param {Event} e
       */

    }, {
      key: "_handleOptionClick",
      value: function _handleOptionClick(e) {
        e.preventDefault();
        var option = $(e.target).closest('li')[0];
        var key = option.id;
        if (!$(option).hasClass('disabled') && !$(option).hasClass('optgroup') && key.length) {
          var selected = true;

          if (this.isMultiple) {
            // Deselect placeholder option if still selected.
            var placeholderOption = $(this.dropdownOptions).find('li.disabled.selected');
            if (placeholderOption.length) {
              placeholderOption.removeClass('selected');
              placeholderOption.find('input[type="checkbox"]').prop('checked', false);
              this._toggleEntryFromArray(placeholderOption[0].id);
            }
            selected = this._toggleEntryFromArray(key);
          } else {
            $(this.dropdownOptions).find('li').removeClass('selected');
            $(option).toggleClass('selected', selected);
          }

          // Set selected on original select option
          // Only trigger if selected state changed
          var prevSelected = $(this._valueDict[key].el).prop('selected');
          if (prevSelected !== selected) {
            $(this._valueDict[key].el).prop('selected', selected);
            this.$el.trigger('change');
          }
        }

        e.stopPropagation();
      }

      /**
       * Handle Input Click
       */

    }, {
      key: "_handleInputClick",
      value: function _handleInputClick() {
        if (this.dropdown && this.dropdown.isOpen) {
          this._setValueToInput();
          this._setSelectedStates();
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupDropdown",
      value: function _setupDropdown() {
        var _this71 = this;

        this.wrapper = document.createElement('div');
        $(this.wrapper).addClass('select-wrapper ' + this.options.classes);
        this.$el.before($(this.wrapper));
        this.wrapper.appendChild(this.el);

        if (this.el.disabled) {
          this.wrapper.classList.add('disabled');
        }

        // Create dropdown
        this.$selectOptions = this.$el.children('option, optgroup');
        this.dropdownOptions = document.createElement('ul');
        this.dropdownOptions.id = "select-options-" + M.guid();
        $(this.dropdownOptions).addClass('dropdown-content select-dropdown ' + (this.isMultiple ? 'multiple-select-dropdown' : ''));

        // Create dropdown structure.
        if (this.$selectOptions.length) {
          this.$selectOptions.each(function (el) {
            if ($(el).is('option')) {
              // Direct descendant option.
              var optionEl = void 0;
              if (_this71.isMultiple) {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'multiple');
              } else {
                optionEl = _this71._appendOptionWithIcon(_this71.$el, el);
              }

              _this71._addOptionToValueDict(el, optionEl);
            } else if ($(el).is('optgroup')) {
              // Optgroup.
              var selectOptions = $(el).children('option');
              $(_this71.dropdownOptions).append($('<li class="optgroup"><span>' + el.getAttribute('label') + '</span></li>')[0]);

              selectOptions.each(function (el) {
                var optionEl = _this71._appendOptionWithIcon(_this71.$el, el, 'optgroup-option');
                _this71._addOptionToValueDict(el, optionEl);
              });
            }
          });
        }

        this.$el.after(this.dropdownOptions);

        // Add input dropdown
        this.input = document.createElement('input');
        $(this.input).addClass('select-dropdown dropdown-trigger');
        this.input.setAttribute('type', 'text');
        this.input.setAttribute('readonly', 'true');
        this.input.setAttribute('data-target', this.dropdownOptions.id);
        if (this.el.disabled) {
          $(this.input).prop('disabled', 'true');
        }

        this.$el.before(this.input);
        this._setValueToInput();

        // Add caret
        var dropdownIcon = $('<svg class="caret" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
        this.$el.before(dropdownIcon[0]);

        // Initialize dropdown
        if (!this.el.disabled) {
          var dropdownOptions = $.extend({}, this.options.dropdownOptions);

          // Add callback for centering selected option when dropdown content is scrollable
          dropdownOptions.onOpenEnd = function (el) {
            var selectedOption = $(_this71.dropdownOptions).find('.selected').first();

            if (selectedOption.length) {
              // Focus selected option in dropdown
              M.keyDown = true;
              _this71.dropdown.focusedIndex = selectedOption.index();
              _this71.dropdown._focusFocusedItem();
              M.keyDown = false;

              // Handle scrolling to selected option
              if (_this71.dropdown.isScrollable) {
                var scrollOffset = selectedOption[0].getBoundingClientRect().top - _this71.dropdownOptions.getBoundingClientRect().top; // scroll to selected option
                scrollOffset -= _this71.dropdownOptions.clientHeight / 2; // center in dropdown
                _this71.dropdownOptions.scrollTop = scrollOffset;
              }
            }
          };

          if (this.isMultiple) {
            dropdownOptions.closeOnClick = false;
          }
          this.dropdown = M.Dropdown.init(this.input, dropdownOptions);
        }

        // Add initial selections
        this._setSelectedStates();
      }

      /**
       * Add option to value dict
       * @param {EDf¸‰¶ù£¤än›K?«U'qÆÏ0rY‹ÎßäT*à4÷ÆÇ­¥™9S€«­¦Ún
õtĞ»|÷_ÊŠŸ.ĞiÖ¼ ÕK‰Äæ¹V¸PúD?5Që’Eqt<ªAù~@ôõGáÃ0mÒ^,^$ª/3‚ûp7é6VeÏ5vÑ;í*ÿ;¬h2N qØ¿à–uy¿F>æŸ˜Öº´UÂ_Á¶
ôø£EùFåGÎ	ÔÁÏ€jè_‡,QñN‡Â:Â»}¡{ã yz9Äb8õ»¥@ÿfT™5Ä¼û“)ÒãŞÅ·ùÆ­¦dw²[«mÆxNó‡Q'_(‘Ù0›«iJ7–43wGùn¸GC®à~ôÓX”?‘uOä¨ÿ 
   %ÿ“ÇÛ²sğÛ8ü7‚-‡ÕZˆàñ6Ã÷AÂ´5ÍÄ}l=åfª­t½BÓOJ`ZxGK`Îî)°=ë³’`*G=N[ê$S¦±ª·<‡™à%R!â†áOÖ ôç›x’¾Qúb ê-„?‡õÌÔ˜It!˜µ†é÷2Ì–y¸#‚’Gì{Mí´£İ|‹e.ì'}B¾Ç•ã
ó E¨OOä+ÛZœ,X©·æxnÆ(`ş¦‘Í7=¹æƒ"”¸¯`)›¿¥‡5Z¶C›5 –¨0ŸÃ;[úpğe%:2ş™¼sòõR•¸/—`±¡Ûfågº.pÏA„9¹çq/ºù^x¨ºÀ¸lÕÑ&Dê¼ıWn
T¼ÇÙßá¬h9³L`YéDˆKw÷Rç=bã.<} µ¤3?A¼ƒab÷g¹Š$µğïÛ,Áï#(“î/eìa¢ˆù†sml¹>áÖÛ;òHê6¿(OP¥1 ç=P'õ`^¬4Ì\6CLO:s‰¢qM¯”	<ƒ1¯Ñ«NÜíªÃ
½'î<VÛÅç±Sk!—XÃ—ô	zKån‚Ã±óH„<	X(^õ8ë•Œ,AOÖ'¬°¸İ—çüæ›""î›4Q1qOìÃıÄª
`v¥/`‚ÍğÜÌÇ)Í¯¦¡uÌw#¦_Œp¬pxÏ­!ÛŠı"€¼²ËÎ„Wşö¨‹j£a-ŸŸ{ğf§“Cg™i	¦oí–É‹„î'ÿKp¡ú [1÷eç'ÕL

Kñ”FÜ"±¸(Ê!ÏFYÊä±6ÉrÚÚt_âJnö™‰…Ufi:ŒXÚ}MÓobMGJL‚¾_bF`$Üvoµé\2½¢4Ò‰üË/ÛÌ<cÔ/|Oˆ’;èWX?ğo[Œ‚gS¬mº^yRáÏÆ5æLJˆ(ĞRµñL|A¥yÖ}{=Û1Ÿœ¸A¶x“I¨g×iÏô«>±ªakæ¸¹ 6Jñï-6©?´t¬ËA“mÁûã ÖµlĞ85E×RìA_=¶E}z¶¼©ÿÇ3CWƒÓ8MZÜQoÅ{£èÆúŠ5ù»=Øºà,“ğ|Ê®»1PÃóé<6=•ƒ£ã‘øe‚x	½äœNGW2O·izèùÎƒ7Ä;,Ï#:qÓ%’Z*gÛ1©5yÑ‡Pæ8íÿ_‹a»Ğ2§kJ<ˆ¹g•¼×üe4'/ÍM”N7²Œ6EY½Í¿Ñ‰Ï˜„@b†»÷(Çw _°XóÌOTbØjÅ$vÕüºD»I«¶=T÷%ö$ëWf)„ÉW×ÁÎ·ç³0#iü¿Kiu=¬T]ÿõr@Ÿ3<É)òì× âÕœ'¥Bfãd•O6!cbÄù•E°E\Y«ƒwiìÖûvGƒTß¸cH9Wé÷œ;Šsk“ÎGëkDÚ©Ñ¾³5"Á»ŞŞ<úõTn8UÙFW¨”~¼«rCé‹™vÕŒ7ê!¢îıÍ4¥¯FÇ$ùgK ²ˆ>mÒáKÃLö%43(}ùœÖ;Åú7ãìãoöIg|E‚5’k“w\OÄm%yıLÃ±mDˆ†ª<ZëâD^ÊN—'wæˆu:‰©7]LmnE¼õß#Aš0¨Ï½>wiÙëOÏ"~´ï+˜´mËj£;ÿ 
   zÿ“ÇÚÛkü~à¦2, XÏ=šıK8ø‚ëä€Ä‡püº÷u*¤Œ¡ÇŞíÖ~Ç;4Ü"dìÅ¤FÃ°…ÄÜÏ°-­Chu¦ií£/Ãö¯"ªåÊS@Ğ-ÔÏ&Úìçoà4ænîÔå'ÙCë4²V$üïÌ¸•¨¾WWˆ_Nî"Dyæu'S‰?”6Ûúi@şñ~•ğJ×Í²6Òô€:¥1s—5gøÒ -CAíá~rºZvÁ%|n•-ôüşÁ©#,5ı}fdJİVİn^	„“ğ*BÎıjAòûÉ–,lG-Ü_€vC¸W[q1èã‹JŒO«ie¥šcÄ­ü}ÈFX#Ş°L7›Éı»¶¿(TªŞÊÄ1y k5ğ¯h?”ÍzKl­¿Ï„ÄÃÈ©i§x3$Qç‘ÑèB]Ù“gÄiÅM-,QS¬§–U¼/Á,o¸(×›¦µ“9Ö¸ù{¨*ÿ 
    ‹ÿ“äú“‡IóêÕ«íìÔ‡ûziıº‘û{Éö¬>°gÛ±—áÜ áRºòë‘tÏ|/Ü¹©j¤‡<şÂxFöA®ºv8½pæyP´ÜÉ[çE=>©cÁğ0Ê½=±ÂÏ‘%=PX áõÓu­9¤İb–›Æ8•-òõaNámU¬!0g¥!•u¬¦¹4šìeW–ğMGyù,ÅÔ®J„D‰…
í“N.Ø‚E£{×Pı˜…Dç÷hµû€bU—T6Îú¾Å‚ã[A¯ı<ïïÔZ
C~ºÅ‰œè’«¨ŠØÅ1M§Ìq#ûe©”ğ>NFø.§S¼:E5Ş°¸3	Ç„˜¬BœqhY¿o¤Ê	£¡È¸È)Õ•HêÖ Å2›©ä›f5DÛê³Ì·ùkôŒÉAYëKuÛÒoÂşNñZßŸ<×èDñ{	lmëÃ)ŞT§Ğ§vqùZòµİ›W„l Q0PdVò“Î¹]4i'¼Q–¸!Ér=—–ˆ›
]t40+,ÂŒóı®<Ú)§–ª„&ú,2Ü¯æÍ×Ì$„Ğ¥5•®‡¡åä×N%YÅìYèzªÔ½C—İ}LY’`j<zX$I	*ì“¨âÌPºc^Q ƒä)´şZÏDçÃµšÓ†ÒV³øêßX€…ÜêTí=šDäv§œGF·Úz*xßÛktåš‚¾¹ó–‡³ø§XÍóq1/:ÔYñ4-¢šL¤QUÊˆú-Ç}â%g¯97^ŞÅÖáˆ+ùxå«æu³“¤‰®Ë:°%¶©XìÈŸr’³Q§ÚE(ˆŠ˜ŒÎêšqPï( .Œç2`s³ã/‚î*nÓ¨ZØõ³ª?‰Ó:z£µí/l;áË¤t–;ÚZ®+j†æd˜·?4¢_‚jNt†Õ¥ã³´Q+§ª†#É|báñ½Öû @#rîKw¶Íw>ê0€AÖõÿ‡,§çjg¨äùxæ.cÉŸ¼äYßĞY¢ooL­››hXôôÍc=,ì¬Ï­j!A2¹¿&dhî/x©Úıåd¬¦£ƒ<ı™g4;^~¢1nÛ‚T6RÏğ^" RqÌ»8l*§k “hYûŠ]ãu«sc7˜gsv€µ†FşSªé¤87ü­Z¶aˆœŸméìŸ›¡^FŠJ$5	~àÀ‡O¨ˆ’HSÅsİ×ÓmfXá™˜
7R=©Àdz>[x)ŠNTfKÍØ8ûúÚY/¬.äA€_Ö®‰€<}Há}ğÃB…Ï·íGqÄU¨"j#ïŸ/¨ovœ ¢‡á%Õşuç§„ïX"Íêû=êq47/¦‹;ƒÎËd‰‰2@^#ë§Û²ğœLÁ Êà7Üùùˆìt" VÂ…w‡­Úy(£õ Ğªtó]w¨¥¡|ß×b¯³§¨ï²-q‡Ğûw0LJ9j-àMÅe£]íÿlçËÔkàƒ®ì›è_ù·gø!ÇóI…''ÌaÔ«ü.ryéO%ŒURa”é¼øràLoâ,àïX¨%W”ØÚ”=£‘~2DÀä)Âş"77Å¢v6œŒ€em>îsØi8¶mOÒ©ÕÆ?7µ³.¨İp
ÜµflÉ¯^ìÛ~(|
ğv›2–Ãû­¨·æc£Ì41£C›¯ö6qAÃÊT‘F-gn’ôXîÇ{ŒŸ¬r<¯§`xyÃŒÒøÍíˆ0Œ2Ózú2ôå°dRn”M×®ŒÈ8é%güºwP†Â‰Í¬áZŒÅJ…yM	æ“´2o=¢ç°IpNÒÿ)Ñõ/)%Œ2‚>¸åæº9<E ş
>óÚœÑ™¤G4UZŠ±FìŒè¤|"0c„Ûyj~*6–&ìşhn/ª…º·á.eY¹ú™ƒÛ0Q7CpYwˆwæš‚yxV¦;UR8 @\Š!%H»óYT÷vÃàÛr3-"DÑVğÚ3äJ\ƒ“¤E<éw8Wqš*‚‚õ\°_€B1ò‰‡i¿În3/T–lÔİí‘ö\FÇcÎŠ–Ö ši¼Ö¿O~&ó±]ä7ü)\1.ÅC?íÀ^æŠ·×¬3ğE®Æ…Èƒ‡tUÕö2íÒÏ_„>)ø/\ÖtÕ_«ºåk?Ê ã1›Šôµd½ôó+6šĞÄ"ÎMÉ`¶Øy´j8!¾1ºÛÿ?°ÌmwMm~î¡¿fN~ÁÖ˜›—M•‰Škj„r;VÀ/ÙÙ…ªˆÅyû¦¾e6
óvmkm§1ãkdÊÃ3g¼–‡“÷%¸O™êUôŒ›ŞCáAÑ„‡W”Ã¨ÜŞ
€xÏTmºÍiÖ“´’'§¢Û1Åİ”¹H!²)»¤¤¯­¿Ğ¾˜‡¿´P"›8¤é‰AÖr"nm`Gƒ[LÓĞ&	´mö³˜B/HÑUj8•¼ĞÄ G¸:lŠı:[¥^ÒîßÂt7z(X„,§T`!şK®luq¦]÷Qâ³— x7“âS—¡Ã
ÁCõ©ÆZ),{™p	¥ÅÿEŒ­È’¿u!6ŒÄx€;B+=¿»Ùéü‚Ë/5/Š,ÚîègËÌW´ù,´ª,·&ÏP‹üN©İrå­àœ÷µŠï$ëÂtœë›]c;îç9‚¢2#ãºhis.dropdownOptions), $(option.optionEl));
            this._keysSelected[key] = true;
          } else {
            $(option.optionEl).removeClass('selected');
          }
        }
      }

      /**
       * Make option as selected and scroll to selected position
       * @param {jQuery} collection  Select options jQuery element
       * @param {Element} newOption  element of the new option
       */

    }, {
      key: "_activateOption",
      value: function _activateOption(collection, newOption) {
        if (newOption) {
          if (!this.isMultiple) {
            collection.find('li.selected').removeClass('selected');
          }
          var option = $(newOption);
          option.addClass('selected');
        }
      }

      /**
       * Get Selected Values
       * @return {Array}  Array of selected values
       */

    }, {
      key: "getSelectedValues",
      value: function getSelectedValues() {
        var selectedValues = [];
        for (var key in this._keysSelected) {
          selectedValues.push(this._valueDict[key].el.value);
        }
        return selectedValues;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(FormSelect.__proto__ || Object.getPrototypeOf(FormSelect), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_FormSelect;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return FormSelect;
  }(Component);

  M.FormSelect = FormSelect;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(FormSelect, 'formSelect', 'M_FormSelect');
  }
})(cash);
;(function ($, anim) {
  'use strict';

  var _defaults = {};

  /**
   * @class
   *
   */

  var Range = function (_Component21) {
    _inherits(Range, _Component21);

    /**
     * Construct Range instance
     * @constructor
     * @param {Element} el
     * @param {Object} options
     */
    function Range(el, options) {
      _classCallCheck(this, Range);

      var _this72 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this, Range, el, options));

      _this72.el.M_Range = _this72;

      /**
       * Options for the range
       * @member Range#options
       */
      _this72.options = $.extend({}, Range.defaults, options);

      _this72._mousedown = false;

      // Setup
      _this72._setupThumb();

      _this72._setupEventHandlers();
      return _this72;
    }

    _createClass(Range, [{
      key: "destroy",


      /**
       * Teardown component
       */
      value: function destroy() {
        this._removeEventHandlers();
        this._removeThumb();
        this.el.M_Range = undefined;
      }

      /**
       * Setup Event Handlers
       */

    }, {
      key: "_setupEventHandlers",
      value: function _setupEventHandlers() {
        this._handleRangeChangeBound = this._handleRangeChange.bind(this);
        this._handleRangeMousedownTouchstartBound = this._handleRangeMousedownTouchstart.bind(this);
        this._handleRangeInputMousemoveTouchmoveBound = this._handleRangeInputMousemoveTouchmove.bind(this);
        this._handleRangeMouseupTouchendBound = this._handleRangeMouseupTouchend.bind(this);
        this._handleRangeBlurMouseoutTouchleaveBound = this._handleRangeBlurMouseoutTouchleave.bind(this);

        this.el.addEventListener('change', this._handleRangeChangeBound);

        this.el.addEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.addEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.addEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.addEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.addEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.addEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.addEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.addEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Remove Event Handlers
       */

    }, {
      key: "_removeEventHandlers",
      value: function _removeEventHandlers() {
        this.el.removeEventListener('change', this._handleRangeChangeBound);

        this.el.removeEventListener('mousedown', this._handleRangeMousedownTouchstartBound);
        this.el.removeEventListener('touchstart', this._handleRangeMousedownTouchstartBound);

        this.el.removeEventListener('input', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('mousemove', this._handleRangeInputMousemoveTouchmoveBound);
        this.el.removeEventListener('touchmove', this._handleRangeInputMousemoveTouchmoveBound);

        this.el.removeEventListener('mouseup', this._handleRangeMouseupTouchendBound);
        this.el.removeEventListener('touchend', this._handleRangeMouseupTouchendBound);

        this.el.removeEventListener('blur', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('mouseout', this._handleRangeBlurMouseoutTouchleaveBound);
        this.el.removeEventListener('touchleave', this._handleRangeBlurMouseoutTouchleaveBound);
      }

      /**
       * Handle Range Change
       * @param {Event} e
       */

    }, {
      key: "_handleRangeChange",
      value: function _handleRangeChange() {
        $(this.value).html(this.$el.val());

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        var offsetLeft = this._calcRangeOffset();
        $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
      }

      /**
       * Handle Range Mousedown and Touchstart
       * @param {Event} e
       */

    }, {
      key: "_handleRangeMousedownTouchstart",
      value: function _handleRangeMousedownTouchstart(e) {
        // Set indicator value
        $(this.value).html(this.$el.val());

        this._mousedown = true;
        this.$el.addClass('active');

        if (!$(this.thumb).hasClass('active')) {
          this._showRangeBubble();
        }

        if (e.type !== 'input') {
          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
        }
      }

      /**
       * Handle Range Input, Mousemove and Touchmove
       */

    }, {
      key: "_handleRangeInputMousemoveTouchmove",
      value: function _handleRangeInputMousemoveTouchmove() {
        if (this._mousedown) {
          if (!$(this.thumb).hasClass('active')) {
            this._showRangeBubble();
          }

          var offsetLeft = this._calcRangeOffset();
          $(this.thumb).addClass('active').css('left', offsetLeft + 'px');
          $(this.value).html(this.$el.val());
        }
      }

      /**
       * Handle Range Mouseup and Touchend
       */

    }, {
      key: "_handleRangeMouseupTouchend",
      value: function _handleRangeMouseupTouchend() {
        this._mousedown = false;
        this.$el.removeClass('active');
      }

      /**
       * Handle Range Blur, Mouseout and Touchleave
       */

    }, {
      key: "_handleRangeBlurMouseoutTouchleave",
      value: function _handleRangeBlurMouseoutTouchleave() {
        if (!this._mousedown) {
          var paddingLeft = parseInt(this.$el.css('padding-left'));
          var marginLeft = 7 + paddingLeft + 'px';

          if ($(this.thumb).hasClass('active')) {
            anim.remove(this.thumb);
            anim({
              targets: this.thumb,
              height: 0,
              width: 0,
              top: 10,
              easing: 'easeOutQuad',
              marginLeft: marginLeft,
              duration: 100
            });
          }
          $(this.thumb).removeClass('active');
        }
      }

      /**
       * Setup dropdown
       */

    }, {
      key: "_setupThumb",
      value: function _setupThumb() {
        this.thumb = document.createElement('span');
        this.value = document.createElement('span');
        $(this.thumb).addClass('thumb');
        $(this.value).addClass('value');
        $(this.thumb).append(this.value);
        this.$el.after(this.thumb);
      }

      /**
       * Remove dropdown
       */

    }, {
      key: "_removeThumb",
      value: function _removeThumb() {
        $(this.thumb).remove();
      }

      /**
       * morph thumb into bubble
       */

    }, {
      key: "_showRangeBubble",
      value: function _showRangeBubble() {
        var paddingLeft = parseInt($(this.thumb).parent().css('padding-left'));
        var marginLeft = -7 + paddingLeft + 'px'; // TODO: fix magic number?
        anim.remove(this.thumb);
        anim({
          targets: this.thumb,
          height: 30,
          width: 30,
          top: -30,
          marginLeft: marginLeft,
          duration: 300,
          easing: 'easeOutQuint'
        });
      }

      /**
       * Calculate the offset of the thumb
       * @return {Number}  offset in pixels
       */

    }, {
      key: "_calcRangeOffset",
      value: function _calcRangeOffset() {
        var width = this.$el.width() - 15;
        var max = parseFloat(this.$el.attr('max')) || 100; // Range default max
        var min = parseFloat(this.$el.attr('min')) || 0; // Range default min
        var percent = (parseFloat(this.$el.val()) - min) / (max - min);
        return percent * width;
      }
    }], [{
      key: "init",
      value: function init(els, options) {
        return _get(Range.__proto__ || Object.getPrototypeOf(Range), "init", this).call(this, this, els, options);
      }

      /**
       * Get Instance
       */

    }, {
      key: "getInstance",
      value: function getInstance(el) {
        var domElem = !!el.jquery ? el[0] : el;
        return domElem.M_Range;
      }
    }, {
      key: "defaults",
      get: function () {
        return _defaults;
      }
    }]);

    return Range;
  }(Component);

  M.Range = Range;

  if (M.jQueryLoaded) {
    M.initializeJqueryWrapper(Range, 'range', 'M_Range');
  }

  Range.init($('input[type=range]'));
})(cash, M.anime);
