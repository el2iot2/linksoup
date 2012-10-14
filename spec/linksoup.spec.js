var linksoup = require('../lib/linksoup.js');

describe("linksoup", function() {
	describe("when parsing spans", function() {
	
		beforeEach(function() {
			this.addMatchers({
				toBeText: function(expectedText) {
					var actual = this.actual;
					this.message = function () {
						return "Expected a text span '" + expectedText +"' but got '" + JSON.stringify(actual) + "'";
					}
					return actual && "text" in actual && !("href" in actual) && actual.text ===  expectedText;
				}
			});
			this.addMatchers({
				toBeHref: function(expectedHref) {
					var actual = this.actual;
					this.message = function () {
						return "Expected a link span '" + expectedHref +"' but got '" + JSON.stringify(actual) + "'";
					}
					return actual && "href" in actual && actual.href ===  expectedHref;
				}
			});
		});
	
		
		//Trying to get all the algorithmic edge cases:
		it("should handle 'text'", function() {
			var i = 0, text = "text";
			expect(linksoup).toBeDefined();
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(1);
			expect(spans[i++]).toBeText("text");
		});
		
		it("should handle 'http://automatonic.net'", function() {
			var i = 0, text = "http://automatonic.net";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(1);
			expect(spans[i++]).toBeHref("http://automatonic.net");
		});
		
		it("should handle '[a.com'", function() {
			var i = 0, text = "[a.com";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(2);
			expect(spans[i++]).toBeText("[");
			
			expect(spans[i++]).toBeHref("a.com");
		});
		
		it("should handle 'a.com]'", function() {
			var i = 0, text = "a.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(2);
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText("]");
			
		});
		
		it("should handle a prefix '[a.com]'", function() {
			var i = 0, text = "[a.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(3);
			expect(spans[i++]).toBeText("[");
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText("]");
		});
		
		it("should handle 'a.com,b.com]'", function() {
			var i = 0, text = "a.com,b.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(4);
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
			expect(spans[i++]).toBeText("]");
			
		});
		
		it("should handle '[a.com,b.com'", function() {
			var i = 0, text = "[a.com,b.com";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(4);
			expect(spans[i++]).toBeText("[");
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
		});
		
		it("should handle '[a.com,b.com]'", function() {
			var i = 0, text = "[a.com,b.com]";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(5);
			expect(spans[i++]).toBeText("[");
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
			expect(spans[i++]).toBeText("]");
		});
		
		it("should handle 'a.com,b.com,c.net]'", function() {
			var i = 0, text = "a.com,b.com,c.net]";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(6);
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("c.net");
			expect(spans[i++]).toBeText("]");
		});
		
		it("should handle '[a.com,b.com,c.net'", function() {
			var i = 0, text = "[a.com,b.com,c.net";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(6);
			expect(spans[i++]).toBeText("[");
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("c.net");
		});
		
		it("should handle '[a.com,b.com,c.net]'", function() {
			var i = 0, text = "[a.com,b.com,c.net]";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(7);
			expect(spans[i++]).toBeText("[");
			expect(spans[i++]).toBeHref("a.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("b.com");
			expect(spans[i++]).toBeText(",");
			expect(spans[i++]).toBeHref("c.net");
			expect(spans[i++]).toBeText("]");
		});
		
		it("should handle '\uD801\uDC00 http://twitter.com \uD801\uDC00 http://test.com'", function() {
			var i = 0, text = "\uD801\uDC00 http://twitter.com \uD801\uDC00 http://test.com";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(4);
			expect(spans[i++]).toBeText("\uD801\uDC00 ");
			expect(spans[i++]).toBeHref("http://twitter.com");
			expect(spans[i++]).toBeText(" \uD801\uDC00 ");
			expect(spans[i++]).toBeHref("http://test.com");
		});
		
		it("should handle '(http://test.com)'", function() {
			var i = 0, text = "(http://test.com)";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(3);
			expect(spans[i++]).toBeText("(");
			expect(spans[i++]).toBeHref("http://test.com");
			expect(spans[i++]).toBeText(")");
		});
		
		it("should handle '[text](http://test.com)'", function() {
			var i = 0, text = "[text](http://test.com)";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			//expect(spans.length).toBe(1);
			expect(spans[i++]).toBeHref("http://test.com", "text");
		});
		
		it("should handle '  [text](http://test.com)'", function() {
			var i = 0, text = "  [text](http://test.com)";
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans[i++]).toBeText("  ");
			//expect(spans.length).toBe(1);
			expect(spans[i++]).toBeHref("http://test.com", "text");
		});
		
		
	});
});
