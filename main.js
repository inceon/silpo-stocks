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
            "categoryId": 2,
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
    	products: [],
    	getDate: (date) => {
			return new Date(date).toLocaleDateString();
		}
    },
    created() {
		return sendData(data)
			.then(res => {
				this.products = res.offersSplited.products;
			});
    }
})




















