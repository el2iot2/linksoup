/*
 * linksoup
 * https://github.com/automatonic/linksoup
 *
 * Copyright (c) 2012 Elliott B. Edwards
 * Licensed under the MIT license.
 */

(function (exports) {
	
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
				text : linkSpan.url,
				href : linkSpan.url
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
	
}(typeof exports === 'undefined' ? this.linksoup = {} : exports));