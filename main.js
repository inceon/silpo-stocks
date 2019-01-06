function sendData(data) {
    var formData = new FormData();

    for (let name in data) {
        formData.append(name, data[name]);
    }

    return fetch("https://silpo.ua/graphql", {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(res => res.data);
}

let data = {
    query: `query offers($categoryId: ID, $storeIds: [ID], $pagingInfo: InputBatch!, $pageSlug: String!, $random: Boolean!) {
  offersSplited(categoryId: $categoryId, storeIds: $storeIds, pagingInfo: $pagingInfo, pageSlug: $pageSlug, random: $random) {
    products {
      count
      items {
        ... on Product {
          ...OptimizedProductsFragment
        }
      }
    }
  }
}

fragment OptimizedProductsFragment on Product {
  id
  slug
  title
  category {
      id
      title
  }
  articul
  weight
  image {
    url
  }
  price
  oldPrice
  appearance {
    size
    color
  }
  promotion {
    id
    slug
    labelIcon {
      url
    }
    labelIconReversed {
      url
    }
  }
  activePeriod {
    start
    end
  }
}`,
    variables: JSON.stringify({
            "categoryId": "",
            "storeIds": ["190"],
            "pagingInfo":
            {
                "offset": 0,
                "limit": 9
            },
            "pageSlug": "actions",
            "random": false,
            "fetchPolicy": "network-only"
        }),
    debugName: "",
    operationName: "offers"
}


new Vue({
    el: '#app',
    data: {
    	productData: {
    		count: 0,
    		items: []
    	},
    	products: [],
    	sortData: {
    		lastKey: "price",
    		reversed: false
    	}
    },
    methods: {
    	getDate: (date) => {
			return new Date(date).toLocaleDateString();
		},
		sort: function(key) {
			if(key == this.sortData.lastKey) {
				this.sortData.reversed = !this.sortData.reversed;
			} else {
				this.sortData.reversed = false;
			}
			this.sortData.lastKey = key;

			this.products.sort((a, b) => {

				if(!isNaN(a[this.sortData.lastKey])) {
					a[this.sortData.lastKey] *= 1;
					b[this.sortData.lastKey] *= 1;
				}

				if (a[this.sortData.lastKey] > b[this.sortData.lastKey]) {
					return this.sortData.reversed ? 1 : -1;
				}
				if (a[this.sortData.lastKey] < b[this.sortData.lastKey]) {
					return this.sortData.reversed ? -1 : 1;
				}
				
				return 0;
			});
		}
    },
    created() {
		return sendData(data)
			.then(res => {
				this.productData = res.offersSplited.products;
				this.products = 
					this.productData.items.map(product => {
		    			product.economy = 
		    				(1 - (product.price / product.oldPrice)).toFixed(2);
		    			product.period = 
		    				`${this.getDate(product.activePeriod.start)} - ${this.getDate(product.activePeriod.end)}`
		    			return product;
		    		});
			});
    }
})




















