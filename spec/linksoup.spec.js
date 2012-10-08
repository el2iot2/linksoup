var linksoup = require('../lib/linksoup.js');

describe("linksoup", function() {
	describe("when parsing spans", function() {
	
		//Trying to get all the algorithmic edge cases:
		it("should handle 'text'", function() {
			var text = "text";
			expect(linksoup).toBeDefined();
			var spans = linksoup.parseSpans(text);
			expect(spans).toBeDefined();
			expect(spans.length).toBe(1);
			expect(spans[0].text).toBe("text");
			expect(spans[0].href).not.toBeDefined();
		});
		
		it("should handle 'http://automatonic.net'", function() {
			var text = "http://automatonic.net";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(1);
			expect(spans[0].text).toBeDefined();
			expect(spans[0].href).toBe("http://automatonic.net");
		});
		
		it("should handle '[a.com'", function() {
			var text = "[a.com";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(2);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
		});
		
		it("should handle 'a.com]'", function() {
			var text = "a.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(2);
			expect(spans[0].text).toBeDefined();
			expect(spans[0].href).toBe("a.com");
			expect(spans[1].text).toBe("]");
			expect(spans[1].href).not.toBeDefined();
		});
		
		it("should handle a prefix '[a.com]'", function() {
			var text = "[a.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(3);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
			expect(spans[2].text).toBe("]");
			expect(spans[2].href).not.toBeDefined();
		});
		
		it("should handle 'a.com,b.com]'", function() {
			var text = "a.com,b.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(4);
			expect(spans[0].text).toBeDefined();
			expect(spans[0].href).toBe("a.com");
			expect(spans[1].text).toBe(",");
			expect(spans[1].href).not.toBeDefined();
			expect(spans[2].text).toBeDefined();
			expect(spans[2].href).toBe("b.com");
			expect(spans[3].text).toBe("]");
			expect(spans[3].href).not.toBeDefined();
		});
		
		it("should handle '[a.com,b.com'", function() {
			var text = "[a.com,b.com";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(4);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
			expect(spans[2].text).toBe(",");
			expect(spans[2].href).not.toBeDefined();
			expect(spans[3].text).toBeDefined();
			expect(spans[3].href).toBe("b.com");
		});
		
		it("should handle '[a.com,b.com]'", function() {
			var text = "[a.com,b.com]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(5);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
			expect(spans[2].text).toBe(",");
			expect(spans[2].href).not.toBeDefined();
			expect(spans[3].text).toBeDefined();
			expect(spans[3].href).toBe("b.com");
			expect(spans[4].text).toBe("]");
			expect(spans[4].href).not.toBeDefined();
		});
		
		it("should handle 'a.com,b.com,c.net]'", function() {
			var text = "a.com,b.com,c.net]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(6);
			expect(spans[0].text).toBeDefined();
			expect(spans[0].href).toBe("a.com");
			expect(spans[1].text).toBe(",");
			expect(spans[1].href).not.toBeDefined();
			expect(spans[2].text).toBeDefined();
			expect(spans[2].href).toBe("b.com");
			expect(spans[3].text).toBe(",");
			expect(spans[3].href).not.toBeDefined();
			expect(spans[4].text).toBeDefined();
			expect(spans[4].href).toBe("c.net");
			expect(spans[5].text).toBe("]");
			expect(spans[5].href).not.toBeDefined();
		});
		
		it("should handle '[a.com,b.com,c.net'", function() {
			var text = "[a.com,b.com,c.net";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(6);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
			expect(spans[2].text).toBe(",");
			expect(spans[2].href).not.toBeDefined();
			expect(spans[3].text).toBeDefined();
			expect(spans[3].href).toBe("b.com");
			expect(spans[4].text).toBe(",");
			expect(spans[4].href).not.toBeDefined();
			expect(spans[5].text).toBeDefined();
			expect(spans[5].href).toBe("c.net");
		});
		
		it("should handle '[a.com,b.com,c.net]'", function() {
			var text = "[a.com,b.com,c.net]";
			var spans = linksoup.parseSpans(text);
			
			expect(spans).toBeDefined();
			expect(spans.length).toBe(7);
			expect(spans[0].text).toBe("[");
			expect(spans[0].href).not.toBeDefined();
			expect(spans[1].text).toBeDefined();
			expect(spans[1].href).toBe("a.com");
			expect(spans[2].text).toBe(",");
			expect(spans[2].href).not.toBeDefined();
			expect(spans[3].text).toBeDefined();
			expect(spans[3].href).toBe("b.com");
			expect(spans[4].text).toBe(",");
			expect(spans[4].href).not.toBeDefined();
			expect(spans[5].text).toBeDefined();
			expect(spans[5].href).toBe("c.net");
			expect(spans[6].text).toBe("]");
			expect(spans[6].href).not.toBeDefined();
		});
	});
});
