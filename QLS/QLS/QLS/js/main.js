document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
  document.getElementById("btnAdd").addEventListener("click", addProduct);
  document.getElementById("btnUpdate").addEventListener("click", updateProduct);
  document.getElementById("btnReset").addEventListener("click", resetForm);
});

function fetchProducts() {
  const apiUrl = "https://localhost:7163/api/products";
  fetch(apiUrl)
    .then(handleResponse)
    .then((data) => displayProducts(data))
    .catch((error) => console.error("Fetch error:", error.message));
}

function handleResponse(response) {
  if (!response.ok) {
    console.error(
      `HTTP error! Status: ${response.status}, URL: ${response.url}`
    );
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }
  return response.json();
}

function displayProducts(products) {
  const productList = document.getElementById("productList");
  if (!productList) {
    console.error("Element with ID 'productList' not found in the DOM.");
    return;
  }
  productList.innerHTML = "";
  products.forEach((product) => {
    productList.innerHTML += createProductRow(product);
  });
}

function createProductRow(product) {
  return `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.description}</td>
        <td>
          <button class="btn btn-danger delete-btn" data-id="${product.id}">Delete</button>
          <button class="btn btn-warning edit-btn" data-id="${product.id}">Edit</button>
          <button class="btn btn-primary view-btn" data-id="${product.id}" data-bs-toggle="modal" data-bs-target="#modalViewDetailInfo">View</button>
        </td>
      </tr>
    `;
}

function addProduct() {
  const productData = {
    name: document.getElementById("bookName").value,
    price: parseFloat(document.getElementById("price").value),
    description: document.getElementById("description").value,
  };
  fetch("https://localhost:7163/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  })
    .then(handleResponse)
    .then((data) => {
      Swal.fire("Success", "Product added successfully!", "success");
      fetchProducts();
      resetForm();
    })
    .catch((error) => {
      console.error("Error adding product:", error);
      Swal.fire("Error", "Failed to add product.", "error");
    });
}

function updateProduct() {
  const productId = document.getElementById("btnUpdate").dataset.id;
  if (!productId) {
    Swal.fire("Error", "Please select a product to update.", "error");
    return;
  }
  const updatedProduct = {
    id: parseInt(productId),
    name: document.getElementById("bookName").value,
    price: parseFloat(document.getElementById("price").value),
    description: document.getElementById("description").value,
  };
  fetch(`https://localhost:7163/api/products/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProduct),
  })
    .then((response) => {
      if (response.status === 204) {
        Swal.fire("Success", "Product updated successfully!", "success");
        fetchProducts();
        resetForm();
      } else {
        throw new Error("Failed to update product");
      }
    })
    .catch((error) => {
      console.error("Error updating product:", error);
      Swal.fire("Error", "Failed to update product.", "error");
    });
}

function deleteProduct(productId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`https://localhost:7163/api/products/${productId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 204) {
            Swal.fire("Deleted!", "Product has been deleted.", "success");
            fetchProducts();
          } else {
            throw new Error("Failed to delete product");
          }
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          Swal.fire("Error", "Failed to delete product.", "error");
        });
    }
  });
}

function viewProduct(productId) {
  fetch(`https://localhost:7163/api/products/${productId}`)
    .then(handleResponse)
    .then((product) => {
      document.querySelector(".modal-body .fullName").textContent =
        product.name;
      document.querySelector(".modal-body .code").textContent = product.id;
      document.querySelector(".modal-body .dateOfBirth").textContent =
        product.name;
      document.querySelector(".modal-body .gender").textContent =
        product.description;
    })
    .catch((error) => {
      console.error("Error fetching product details:", error);
      Swal.fire("Error", "Failed to load product details.", "error");
    });
}

function resetForm() {
  document.getElementById("bookName").value = "";
  document.getElementById("price").value = "";
  document.getElementById("description").value = "";
  document.getElementById("btnUpdate").removeAttribute("data-id");
  document.getElementById("btnAdd").style.display = "inline-block";
  document.getElementById("btnUpdate").style.display = "inline-block";
  document.getElementById("btnClear").style.display = "none";
}

// Event delegation for dynamic buttons
document.getElementById("productList").addEventListener("click", (e) => {
  const target = e.target;
  const productId = target.dataset.id;
  if (target.classList.contains("delete-btn")) {
    deleteProduct(productId);
  } else if (target.classList.contains("edit-btn")) {
    fetch(`https://localhost:7163/api/products/${productId}`)
      .then(handleResponse)
      .then((product) => {
        document.getElementById("bookName").value = product.name;
        document.getElementById("price").value = product.price;
        document.getElementById("description").value = product.description;
        document.getElementById("btnUpdate").dataset.id = product.id;
        document.getElementById("btnAdd").style.display = "none";
        document.getElementById("btnClear").style.display = "inline-block";
      })
      .catch((error) =>
        console.error("Error loading product for edit:", error)
      );
  } else if (target.classList.contains("view-btn")) {
    viewProduct(productId);
  }
});
