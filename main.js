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

let queryForProductsData = {
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
            "categoryId": 0,
            "storeIds": ["190"],
            "pagingInfo":{},
            "pageSlug": "actions",
            "random": false
        })
};

let queryForCategories = {
    query: `query productCategories {
			  productCategories {
			    id
			    title
			  }
			}`,
    variables: {}
}

new Vue({
    el: '#app',
    data: {
    	productData: {
    		count: 0,
    		items: []
    	},
    	products: [],
    	productCategories: [],
    	selectedCategory: -1,
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

				// if this number the sort as number
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
		},
    },
    computed: {
    	filteredProducts: function() {
    		return this.products.filter((product) => {
	    		if(this.selectedCategory == -1 || this.selectedCategory == 0) {
	    			return true;
	    		}
	    		return product.category.id == this.selectedCategory;
    		});
    	}
    },
    created() {
    	sendData(queryForCategories)
    		.then((res) => {
    			this.productCategories = res.productCategories;
    		});
		return sendData(queryForProductsData)
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




















