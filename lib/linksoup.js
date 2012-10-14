/*
 * linksoup
 * https://github.com/automatonic/linksoup
 *
 * Copyright (c) 2012 Elliott B. Edwards
 * Licensed under the MIT license.
 */

(function (exports) {
	
	//forward declare regexen
	var regexen = {};
	
	//Parses the text into an array of spans
	function parseSpans(text) {
		var links = parseLinks(text);
		/*Represented as
		[{
		href: "http://yada",
		start: startIndex,
		end: endIndex
		}]*/
		var spans = [];
		var lastSpan = null;
		
		function isPrefixedLinkSpan(span)
		{
			return span && "href" in span && span.prefix && "proposed" in span.prefix;
		}
		
		function isTextSpan(span)
		{
			return span && !("href" in span);
		}
		
		function addTextSpan(text) {
			//if the last span was a candidate
			if (isPrefixedLinkSpan(lastSpan)) {
				//make sure there is a valid suffix
				if (regexen.matchMarkdownLinkSuffix.test(text))	{
					//is there any valid whitespace remaining?
					text = RegExp.$3;
					//use the title (if specified)
					if (RegExp.$1) {
						lastSpan.title = RegExp.$1;
					}
					//use the proposed link text for the verified link
					lastSpan.text = lastSpan.prefix.proposed.linkText;
					
					//if there was valid prefix text, use it
					if (lastSpan.prefix.proposed.text) {
						lastSpan.prefix.text = lastSpan.prefix.proposed.text;
						delete lastSpan.prefix["proposed"]; //clean up proposal	
					}
					else {
						spans.splice(spans.length - 2, 1); //remove prefix
						lastSpan = lastSpan.prefix;
					}
				}
				else {
					delete lastSpan.prefix["proposed"]; //clean up proposal...no match...no modification
				}
				delete lastSpan["prefix"]; //clean up prefix scratchwork
			}
			if (text) {
				lastSpan = {
					text : text
				};
				spans.push(lastSpan);
			}
		}
		
		function addLinkSpan(linkSpan) {
			var span = {
				href : linkSpan.href
			};

			if (isTextSpan(lastSpan) && regexen.matchMarkdownLinkPrefix.test(lastSpan.text))	{
				lastSpan.proposed = { text: RegExp.$1, linkText: RegExp.$2 };
				span.prefix = lastSpan;
			}
		
			lastSpan = span;
			spans.push(lastSpan);
		}
		
		//No links found, all text
		if (links.length === 0) {
			addTextSpan(text);
		} 
		//One or more links found
		else {
			var firstLink = links[0],
			lastLink = links[links.length - 1];
			
			//Was there text before the first link?
			if (firstLink.start > 0) {
				addTextSpan(text.substring(0, firstLink.start));
			}
			//Handle single link
			if (links.length === 1) {
				addLinkSpan(firstLink);
			} else {
				//push the firstLink
				addLinkSpan(firstLink);
				var prevLink = firstLink;
				
				//loop from the second
				for (var i = 1; i < links.length; i++) {
					//is there text between?
					if (links[i].start - prevLink.end >= 1) {
						addTextSpan(text.substring(prevLink.end, links[i].start));
					}
					//add link
					addLinkSpan(prevLink = links[i]);
				}
			}
			//Was there text after the links?
			if (lastLink.end < (text.length)) {
				addTextSpan(text.substring(lastLink.end));
			}
		}
		return spans;
	}
	exports.parseSpans = parseSpans;
	
	function parseLinks(text, options) {
		if (!options) {
			options = {
				extractUrlsWithoutProtocol : true
			};
		}
		
		if (!text || (options.extractUrlsWithoutProtocol ? !text.match(/\./) : !text.match(/:/))) {
			return [];
		}

		var links = [];
		while (regexen.extractUrl.exec(text)) {
			var before = RegExp.$2,
				protocol = RegExp.$4,
				domain = RegExp.$5,
				path = RegExp.$7,
				link = {
					href: RegExp.$3,
					end: regexen.extractUrl.lastIndex,
					start: regexen.extractUrl.lastIndex - RegExp.$3.length
				};
			
			// if protocol is missing and domain contains non-ASCII characters,
			// extract ASCII-only domains.
			if (!protocol) {
				if (!options.extractUrlsWithoutProtocol || before.match(regexen.invalidUrlWithoutProtocolPrecedingChars)) {
					continue;
				}
				
				//wrap context into object so we can pass and modify it
				var ctx = {
					domain: domain,
					cursor: link,
					links: links,
					lastLink: null,
					lastLinkInvalidMatch: false,
					asciiEndPosition: 0};
					
				domain.replace(regexen.validAsciiDomain, makeFuncAsciiDomainReplace(ctx));
				
				// no ASCII-only domain found. Skip the entire URL.
				if (ctx.lastLink === null) {
					continue;
				}
				
				// lastSpan only contains domain. Need to add path and query if they exist.
				if (path) {
					if (ctx.lastLinkInvalidMatch) {
						links.push(ctx.lastLink);
					}
					ctx.lastLink.href = link.href.replace(domain, ctx.lastLink.href);
					ctx.lastLink.end = link.end;
				}
			} 
			else {
				// In the case of t.co URLs, don't allow additional path characters.
				if (link.href.match(regexen.validTcoUrl)) {
					link.href = RegExp.lastMatch;
					link.end = link.start + link.href.length;
				}
				links.push(link);
			}
		}
		
		return links;
	}
	
	exports.parseLinks = parseLinks;
	
	//return a closure to handle a custom ascii domain replace
	function makeFuncAsciiDomainReplace(ctx) {
		return function (asciiDomain) {
			var asciiStartPosition = ctx.domain.indexOf(asciiDomain, ctx.asciiEndPosition);
			ctx.asciiEndPosition = asciiStartPosition + asciiDomain.length;
			ctx.lastLink = {
				href : asciiDomain,
				start: ctx.cursor.start + asciiStartPosition,
				end: ctx.cursor.start + ctx.asciiEndPosition
			};
			ctx.lastLinkInvalidMatch = asciiDomain.match(regexen.invalidShortDomain);
			if (!ctx.lastLinkInvalidMatch) {
				ctx.links.push(ctx.lastLink);
			}
		};
	}
	
	function regexSupplant(regex, flags) {
		flags = flags || "";
		if (typeof regex !== "string") {
			if (regex.global && flags.indexOf("g") < 0) {
				flags += "g";
			}
			if (regex.ignoreCase && flags.indexOf("i") < 0) {
				flags += "i";
			}
			if (regex.multiline && flags.indexOf("m") < 0) {
				flags += "m";
			}
			
			regex = regex.source;
		}
		
		return new RegExp(regex.replace(/#\{(\w+)\}/g, function (match, name) {
				var newRegex = regexen[name] || "";
				if (typeof newRegex !== "string") {
					newRegex = newRegex.source;
				}
				return newRegex;
			}), flags);
	}
	
	// simple string interpolation
	function stringSupplant(str, values) {
		return str.replace(/#\{(\w+)\}/g, function(match, name) {
			return values[name] || "";
		});
	}
	
	function addCharsToCharClass(charClass, start, end) {
		var s = String.fromCharCode(start);
		if (end !== start) {
			s += "-" + String.fromCharCode(end);
		}
		charClass.push(s);
		return charClass;
	}
	
	// Space is more than %20, U+3000 for example is the full-width space used with Kanji. Provide a short-hand
	// to access both the list of characters and a pattern suitible for use with String#split
	// Taken from: ActiveSupport::Multibyte::Handlers::UTF8Handler::UNICODE_WHITESPACE
	var fromCode = String.fromCharCode;
	var UNICODE_SPACES = [
	fromCode(0x0020), // White_Space # Zs       SPACE
	fromCode(0x0085), // White_Space # Cc       <control-0085>
	fromCode(0x00A0), // White_Space # Zs       NO-BREAK SPACE
	fromCode(0x1680), // White_Space # Zs       OGHAM SPACE MARK
	fromCode(0x180E), // White_Space # Zs       MONGOLIAN VOWEL SEPARATOR
	fromCode(0x2028), // White_Space # Zl       LINE SEPARATOR
	fromCode(0x2029), // White_Space # Zp       PARAGRAPH SEPARATOR
	fromCode(0x202F), // White_Space # Zs       NARROW NO-BREAK SPACE
	fromCode(0x205F), // White_Space # Zs       MEDIUM MATHEMATICAL SPACE
	fromCode(0x3000)  // White_Space # Zs       IDEOGRAPHIC SPACE
	];
	addCharsToCharClass(UNICODE_SPACES, 0x009, 0x00D); // White_Space # Cc   [5] <control-0009>..<control-000D>
	addCharsToCharClass(UNICODE_SPACES, 0x2000, 0x200A); // White_Space # Zs  [11] EN QUAD..HAIR SPACE

	var INVALID_CHARS = [
	fromCode(0xFFFE),
	fromCode(0xFEFF), // BOM
	fromCode(0xFFFF) // Special
	];
	addCharsToCharClass(INVALID_CHARS, 0x202A, 0x202E); // Directional change
	
	var latinAccentChars = [];
	// Latin accented characters (subtracted 0xD7 from the range, it's a confusable multiplication sign. Looks like "x")
	addCharsToCharClass(latinAccentChars, 0x00c0, 0x00d6);
	addCharsToCharClass(latinAccentChars, 0x00d8, 0x00f6);
	addCharsToCharClass(latinAccentChars, 0x00f8, 0x00ff);
	// Latin Extended A and B
	addCharsToCharClass(latinAccentChars, 0x0100, 0x024f);
	// assorted IPA Extensions
	addCharsToCharClass(latinAccentChars, 0x0253, 0x0254);
	addCharsToCharClass(latinAccentChars, 0x0256, 0x0257);
	addCharsToCharClass(latinAccentChars, 0x0259, 0x0259);
	addCharsToCharClass(latinAccentChars, 0x025b, 0x025b);
	addCharsToCharClass(latinAccentChars, 0x0263, 0x0263);
	addCharsToCharClass(latinAccentChars, 0x0268, 0x0268);
	addCharsToCharClass(latinAccentChars, 0x026f, 0x026f);
	addCharsToCharClass(latinAccentChars, 0x0272, 0x0272);
	addCharsToCharClass(latinAccentChars, 0x0289, 0x0289);
	addCharsToCharClass(latinAccentChars, 0x028b, 0x028b);
	// Okina for Hawaiian (it *is* a letter character)
	addCharsToCharClass(latinAccentChars, 0x02bb, 0x02bb);
	// Combining diacritics
	addCharsToCharClass(latinAccentChars, 0x0300, 0x036f);
	// Latin Extended Additional
	addCharsToCharClass(latinAccentChars, 0x1e00, 0x1eff);
	regexen.latinAccentChars = regexSupplant(latinAccentChars.join(""));
	
	regexen.punct = new RegExp("\\!'#%&'\\(\\)*\\+,\\\\\\-\\.\\/:;<=>\\?@\\[\\]\\^_{|}~\\$");
	
	regexen.spaces_group = regexSupplant(UNICODE_SPACES.join(""));
	regexen.invalid_chars_group = regexSupplant(INVALID_CHARS.join(""));
	
	regexen.validUrlPrecedingChars = regexSupplant("(?:[^A-Za-z0-9@＠$#＃#{invalid_chars_group}]|^)");
	regexen.invalidUrlWithoutProtocolPrecedingChars = "[\\-_\\.\\\\/]$";
	regexen.invalidDomainChars = stringSupplant("#{punct}#{spaces_group}#{invalid_chars_group}", regexen);
	regexen.validDomainChars = regexSupplant("[^#{invalidDomainChars}]");
	regexen.validSubdomain = regexSupplant("(?:(?:#{validDomainChars}(?:[_-]|#{validDomainChars})*)?#{validDomainChars}\\.)");
	regexen.validDomainName = regexSupplant("(?:(?:#{validDomainChars}(?:-|#{validDomainChars})*)?#{validDomainChars}\\.)");
	regexen.validGTLD = regexSupplant("(?:(?:aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|xxx)(?=[^0-9a-zA-Z]|$))");
	regexen.validCCTLD = regexSupplant("(?:(?:ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)(?=[^0-9a-zA-Z]|$))");
	regexen.validPunycode = regexSupplant(/(?:xn--[0-9a-z]+)/);
	regexen.validDomain = regexSupplant("(?:#{validSubdomain}*#{validDomainName}(?:#{validGTLD}|#{validCCTLD}|#{validPunycode}))");
	regexen.validAsciiDomain = regexSupplant(new RegExp("(?:(?:[a-z0-9#{latinAccentChars}]+)\\.)+(?:#{validGTLD}|#{validCCTLD}|#{validPunycode})", "gi"));
	regexen.invalidShortDomain = regexSupplant("^#{validDomainName}#{validCCTLD}$");

	regexen.validPortNumber = regexSupplant(/[0-9]+/);

	regexen.validGeneralUrlPathChars = regexSupplant(new RegExp("[a-z0-9!\\*';:=\\+,\\.\\$\\/%#\\[\\]\\-_~|&#{latinAccentChars}]", "i"));
	// Allow URL paths to contain balanced parens
	//  1. Used in Wikipedia URLs like /Primer_(film)
	//  2. Used in IIS sessions like /S(dfd346)/
	regexen.validUrlBalancedParens = regexSupplant(new RegExp("\\(#{validGeneralUrlPathChars}+\\)", "i"));
	// Valid end-of-path chracters (so /foo. does not gobble the period).
	// 1. Allow =&# for empty URL parameters and other URL-join artifacts
	regexen.validUrlPathEndingChars = regexSupplant(new RegExp("[\\+\\-a-z0-9=_#\\/#{latinAccentChars}]|(?:#{validUrlBalancedParens})", "i"));
	// Allow @ in a url, but only in the middle. Catch things like http://example.com/@user/
	regexen.validUrlPath = regexSupplant('(?:' +
	'(?:' +
		'#{validGeneralUrlPathChars}*' +
		'(?:#{validUrlBalancedParens}#{validGeneralUrlPathChars}*)*' +
		'#{validUrlPathEndingChars}'+
		')|(?:@#{validGeneralUrlPathChars}+\/)'+
	')', 'i');

	regexen.validUrlQueryChars = /[a-z0-9!?\*'\(\);:&=\+\$\/%#\[\]\-_\.,~|]/i;
	regexen.validUrlQueryEndingChars = /[a-z0-9_&=#\/]/i;
	//matches simple square brackets and open paren
	//first group captures any relevant, leading whitespace
	//second group captures the bracketed text content
	regexen.matchMarkdownLinkPrefix = /^(.*)\[([^\]]*)\]\s*\(\s*$/i;
	
	//matches option title string and close paren
	//outer group captures optional title string (with quotes)
	//inner group captures title string without quotes
	regexen.matchMarkdownLinkSuffix = /^\s*("([^"]*)")?\s*\)(.*)$/i;
	regexen.extractUrl = regexSupplant(
	'('                                                            + // $1 total match
		'(#{validUrlPrecedingChars})'                                + // $2 Preceeding chracter
		'('                                                          + // $3 URL
			'(https?:\\/\\/)?'                                         + // $4 Protocol (optional)
			'(#{validDomain})'                                         + // $5 Domain(s)
			'(?::(#{validPortNumber}))?'                               + // $6 Port number (optional)
			'(\\/#{validUrlPath}*)?'                                   + // $7 URL Path
			'(\\?#{validUrlQueryChars}*#{validUrlQueryEndingChars})?'  + // $8 Query String
		')'                                                          +
	')',
	'gi');

	regexen.validTcoUrl = /^https?:\/\/t\.co\/[a-z0-9]+/i;
	
	
}(typeof exports === 'undefined' ? this.linksoup = {} : exports));