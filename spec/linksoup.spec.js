var linksoup = require('../lib/linksoup.js');

describe("linksoup", function() {
	describe("when parsing spans", function() {
	
		//Trying to get all the algorithmic edge cases:
		it("should handle 'text'", function() {
			var text = "text";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(1);
			expect(linkSoup.spans[0].text).toBe("text");
			expect(linkSoup.spans[0].href).not.toBeDefined();
		});
		
		it("should handle 'http://automatonic.net'", function() {
			var text = "http://automatonic.net";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(1);
			expect(linkSoup.spans[0].text).toBeDefined();
			expect(linkSoup.spans[0].href).toBe("http://automatonic.net");
		});
		
		it("should handle '[a.com'", function() {
			var text = "[a.com";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(2);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
		});
		
		it("should handle 'a.com]'", function() {
			var text = "a.com]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(2);
			expect(linkSoup.spans[0].text).toBeDefined();
			expect(linkSoup.spans[0].href).toBe("a.com");
			expect(linkSoup.spans[1].text).toBe("]");
			expect(linkSoup.spans[1].href).not.toBeDefined();
		});
		
		it("should handle a prefix '[a.com]'", function() {
			var text = "[a.com]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(3);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
			expect(linkSoup.spans[2].text).toBe("]");
			expect(linkSoup.spans[2].href).not.toBeDefined();
		});
		
		it("should handle 'a.com,b.com]'", function() {
			var text = "a.com,b.com]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(4);
			expect(linkSoup.spans[0].text).toBeDefined();
			expect(linkSoup.spans[0].href).toBe("a.com");
			expect(linkSoup.spans[1].text).toBe(",");
			expect(linkSoup.spans[1].href).not.toBeDefined();
			expect(linkSoup.spans[2].text).toBeDefined();
			expect(linkSoup.spans[2].href).toBe("b.com");
			expect(linkSoup.spans[3].text).toBe("]");
			expect(linkSoup.spans[3].href).not.toBeDefined();
		});
		
		it("should handle '[a.com,b.com'", function() {
			var text = "[a.com,b.com";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(4);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
			expect(linkSoup.spans[2].text).toBe(",");
			expect(linkSoup.spans[2].href).not.toBeDefined();
			expect(linkSoup.spans[3].text).toBeDefined();
			expect(linkSoup.spans[3].href).toBe("b.com");
		});
		
		it("should handle '[a.com,b.com]'", function() {
			var text = "[a.com,b.com]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(5);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
			expect(linkSoup.spans[2].text).toBe(",");
			expect(linkSoup.spans[2].href).not.toBeDefined();
			expect(linkSoup.spans[3].text).toBeDefined();
			expect(linkSoup.spans[3].href).toBe("b.com");
			expect(linkSoup.spans[4].text).toBe("]");
			expect(linkSoup.spans[4].href).not.toBeDefined();
		});
		
		it("should handle 'a.com,b.com,c.net]'", function() {
			var text = "a.com,b.com,c.net]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(6);
			expect(linkSoup.spans[0].text).toBeDefined();
			expect(linkSoup.spans[0].href).toBe("a.com");
			expect(linkSoup.spans[1].text).toBe(",");
			expect(linkSoup.spans[1].href).not.toBeDefined();
			expect(linkSoup.spans[2].text).toBeDefined();
			expect(linkSoup.spans[2].href).toBe("b.com");
			expect(linkSoup.spans[3].text).toBe(",");
			expect(linkSoup.spans[3].href).not.toBeDefined();
			expect(linkSoup.spans[4].text).toBeDefined();
			expect(linkSoup.spans[4].href).toBe("c.net");
			expect(linkSoup.spans[5].text).toBe("]");
			expect(linkSoup.spans[5].href).not.toBeDefined();
		});
		
		it("should handle '[a.com,b.com,c.net'", function() {
			var text = "[a.com,b.com,c.net";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(6);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
			expect(linkSoup.spans[2].text).toBe(",");
			expect(linkSoup.spans[2].href).not.toBeDefined();
			expect(linkSoup.spans[3].text).toBeDefined();
			expect(linkSoup.spans[3].href).toBe("b.com");
			expect(linkSoup.spans[4].text).toBe(",");
			expect(linkSoup.spans[4].href).not.toBeDefined();
			expect(linkSoup.spans[5].text).toBeDefined();
			expect(linkSoup.spans[5].href).toBe("c.net");
		});
		
		it("should handle '[a.com,b.com,c.net]'", function() {
			var text = "[a.com,b.com,c.net]";
			var linkSoup = upcoming.test.toLinkSoup(text);
			expect(linkSoup).toBeDefined();
			expect(linkSoup.spans).toBeDefined();
			expect(linkSoup.spans.length).toBe(7);
			expect(linkSoup.spans[0].text).toBe("[");
			expect(linkSoup.spans[0].href).not.toBeDefined();
			expect(linkSoup.spans[1].text).toBeDefined();
			expect(linkSoup.spans[1].href).toBe("a.com");
			expect(linkSoup.spans[2].text).toBe(",");
			expect(linkSoup.spans[2].href).not.toBeDefined();
			expect(linkSoup.spans[3].text).toBeDefined();
			expect(linkSoup.spans[3].href).toBe("b.com");
			expect(linkSoup.spans[4].text).toBe(",");
			expect(linkSoup.spans[4].href).not.toBeDefined();
			expect(linkSoup.spans[5].text).toBeDefined();
			expect(linkSoup.spans[5].href).toBe("c.net");
			expect(linkSoup.spans[6].text).toBe("]");
			expect(linkSoup.spans[6].href).not.toBeDefined();
		});
	});
});
