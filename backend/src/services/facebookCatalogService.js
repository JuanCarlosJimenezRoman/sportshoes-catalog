// src/services/facebookCatalogService.js
import axios from 'axios';
import { prisma } from '../server.js';

const FB_API_VERSION = process.env.FACEBOOK_API_VERSION || 'v21.0';
const FB_API_BASE = `https://graph.facebook.com/${FB_API_VERSION}`;
const CATALOG_ID = process.env.FACEBOOK_CATALOG_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

class FacebookCatalogService {
  constructor() {
    this.baseURL = FB_API_BASE;
    this.catalogId = CATALOG_ID;
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }

  async createProductFeed() {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.catalogId}/product_feeds`,
        {
          name: `SportShoes Feed ${new Date().toISOString().split('T')[0]}`,
          schedule: {
            interval: 'DAILY',
            url: `${process.env.BASE_URL}/api/facebook/feed`,
            hour: '02'
          }
        },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creando feed:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  async uploadProductsBatch(products) {
    try {
      const requests = products.map(product => ({
        method: 'UPDATE',
        retailer_id: product.sku,
        data: this.formatProductForFacebook(product)
      }));

      const response = await axios.post(
        `${this.baseURL}/${this.catalogId}/batch`,
        {
          access_token: ACCESS_TOKEN,
          requests: requests
        },
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error en batch:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  async createProductDirect(productData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.catalogId}/products`,
        {
          ...productData,
          access_token: ACCESS_TOKEN
        },
        { headers: this.getHeaders() }
      );
      return { success: true, id: response.data.id };
    } catch (error) {
      const fbError = error.response?.data?.error;
      throw new Error(fbError?.message || error.message);
    }
  }

  formatProductForFacebook(product) {
    const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const totalStock = product.variants
      ?.filter(v => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0) || 0;

    return {
      retailer_id: product.sku,
      name: product.name,
      description: (product.description || '').substring(0, 999),
      image_url: mainImage?.url ? `${baseUrl}${mainImage.url}` : '',
      additional_image_urls: product.images
        ?.filter(img => !img.isMain)
        .map(img => `${baseUrl}${img.url}`)
        .slice(0, 10) || [],
      url: `${frontendUrl}/product/${product.slug}`,
      brand: product.brand?.name || '',
      condition: 'new',
      availability: totalStock > 0 ? 'in stock' : 'out of stock',
      inventory: totalStock,
      price: `${product.price} MXN`,
      currency: 'MXN',
      gender: this.mapGender(product.gender),
      age_group: product.gender === 'KIDS' ? 'kids' : 'adult',
      google_product_category: 187,
      product_type: product.category?.name || '',
      color: Array.isArray(product.colors) ? product.colors[0] || '' : '',
      size: product.variants
        ?.filter(v => v.stock > 0 && v.isActive)
        .map(v => v.size)
        .join(',') || '',
      custom_data: JSON.stringify({
        sku: product.sku,
        category: product.category?.name,
        materials: Array.isArray(product.materials) ? product.materials.join(',') : ''
      })
    };
  }

  mapGender(gender) {
    const map = { 'MEN': 'male', 'WOMEN': 'female', 'UNISEX': 'unisex', 'KIDS': 'unisex' };
    return map[gender] || 'unisex';
  }

  async getCatalogInfo() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.catalogId}`,
        {
          headers: this.getHeaders(),
          params: { fields: 'id,name,product_count' }
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  async getFeeds() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.catalogId}/product_feeds`,
        {
          headers: this.getHeaders(),
          params: { fields: 'id,name,url,schedule,status' }
        }
      );
      return { success: true, data: response.data?.data || [] };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  async uploadFeed(feedUrl) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.catalogId}/product_feeds`,
        {
          name: `Feed ${new Date().toISOString()}`,
          schedule: {
            interval: 'HOURLY',
            url: feedUrl || `${process.env.BASE_URL}/api/facebook/feed`,
            hour: '*'
          }
        },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }
}

export default new FacebookCatalogService();