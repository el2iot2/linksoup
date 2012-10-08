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
		
		function addTextSpan(textSpan) {
			spans.push({
				text : textSpan
			});
		}
		
		function addLinkSpan(linkSpan) {
			spans.push({
				text : linkSpan.href,
				href : linkSpan.href
			});
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