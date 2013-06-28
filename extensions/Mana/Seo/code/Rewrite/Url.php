<?php
/** 
 * @category    Mana
 * @package     Mana_Seo
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */
/**
 * @author Mana Team
 *
 */
class Mana_Seo_Rewrite_Url extends Mage_Core_Model_Url {
//    protected $_escape = false;
    /**
     * @var Mana_Seo_Helper_PageType
     */
    protected $_pageType;

    protected $_pageUrlKey;

    protected $_suffix;

    protected $_routePath;

    protected $_routeParams;

    protected $_query;

    /**
     * @var Mana_Seo_Model_Schema
     */
    protected $_schema;

//    public function setEscape($value) {
//        $this->_escape = $value;
//
//        return $this;
//    }

    public function getMagentoUrl($routePath = null, $routeParams = null) {
        return parent::getUrl($routePath, $routeParams);
    }

    public function getUrl($routePath = null, $routeParams = null) {
//        $this->_escape = isset($routeParams['_escape']) ? $routeParams['_escape'] :
//            (isset($routeParams['_m_escape']) ? $routeParams['_m_escape'] : $this->_escape);

        $this->_routeParams = $routeParams;
        if (isset($routeParams['_use_rewrite'])) {
            /* @var $seo Mana_Seo_Helper_Data */
            $seo = Mage::helper('mana_seo');

            $this->_schema = $seo->getActiveSchema($this->getStore()->getId());

            $this->_routePath = $this->_populateCurrentRouteFromRequest($routePath);

            $query = null;
            if (isset($this->_routeParams['_query'])) {
                $this->purgeQueryParams();
                $query = $this->_routeParams['_query'];
                unset($this->_routeParams['_query']);
            }
            $this->_query = $query;

            if ($this->_pageType = $this->_getPageType($this->_routePath)) {
                $this->_suffix = $this->_pageType->getCurrentSuffix();
                $this->_pageUrlKey = $this->_pageType->getUrlKey($this);
            }
        }

        return parent::getUrl($routePath, $this->_routeParams);
    }

    public function getRoutePath($routeParams = array()) {
        if ($this->_pageUrlKey === null) {
            return parent::getRoutePath($routeParams);
        }

        /* @var $core Mana_Core_Helper_Data */
        $core = Mage::helper('mana_core');

        if (!$this->hasData('route_path')) {
            $query = $this->_query;
            if ($query !== null) {
                if (is_string($query)) {
                    $this->setQuery($query);
                }
                elseif (is_array($query)) {
                    $this->setQueryParams($query, !empty($routeParams['_current']));
                }
                if ($query === false) {
                    $this->setQueryParams(array());
                }
            }

            $queryParams = $this->getQueryParams();
            $seoParams = array();
            foreach ($this->getQueryParams() as $key => $value) {
                $path = false;
                if ($value !== null) {
                    if ($url = $this->_getParameterUrl($key)) {
                        $position = $url->getPosition();
                        $attribute_id = $url->getAttributeId();
                        $category_id = null;
                        switch ($url->getType()) {
                            case Mana_Seo_Model_ParsedUrl::PARAMETER_ATTRIBUTE:
                                $path = $this->_generateAttributeParameter($url, $value);
                                break;
                            case Mana_Seo_Model_ParsedUrl::PARAMETER_CATEGORY:
                                list($path, $category_id) = $this->_generateCategoryParameter($url, $value);
                                break;
                            case Mana_Seo_Model_ParsedUrl::PARAMETER_PRICE:
                                $path = $this->_generatePriceParameter($url, $value);
                                break;
                            case Mana_Seo_Model_ParsedUrl::PARAMETER_TOOLBAR:
                                $path = $this->_generateToolbarParameter($url, $value);
                                break;
                            default:
                                throw new Exception('Not implemented');
                        }
                    }
                }
                if ($path) {
                    $seoParams[$key] = compact('path', 'position', 'attribute_id', 'category_id');
                    unset($queryParams[$key]);
                }
            }

            $this->_redirectToSubcategory($seoParams);
            uasort($seoParams, array($this, '_compareSeoParams'));

            $routePath = $this->_pageUrlKey;
            $first = true;
            foreach ($seoParams as $path) {
                if ($first) {
                    $routePath .= $this->_schema->getQuerySeparator();
                    $first = false;
                }
                else {
                    $routePath .= $this->_schema->getParamSeparator();
                }
                $routePath .= $path['path'];
            }

            if ($routePath) {
                $routePath .= $core->addDotToSuffix($this->_suffix);
            }

            $this->setData('query_params', $queryParams);
            $this->setData('route_path', $routePath);
        }
        return $this->_getData('route_path');
    }

    /**
     * @param string $route
     * @return bool|Mana_Seo_Helper_PageType
     */
    protected function _getPageType($route) {
        /* @var $seo Mana_Seo_Helper_Data */
        $seo = Mage::helper('mana_seo');

        foreach ($seo->getPageTypes() as $pageType) {
            if ($pageType->matchRoute($route)) {
                return $pageType;
            }
        }

        return false;
    }

    protected function _populateCurrentRouteFromRequest($route) {
        /* @var $request Mage_Core_Controller_Request_Http */
        $request = $this->getRequest();
        $route = explode('/', $route);
        if (isset($route[0]) && $route[0] == '*') $route[0] = $request->getRouteName();
        if (isset($route[1]) && $route[1] == '*') $route[1] = $request->getControllerName();
        if (isset($route[2]) && $route[2] == '*') $route[2] = $request->getActionName();

        return $route[0] . (isset($route[1]) ? '/' . $route[1] : '') . (isset($route[2]) ? '/' . $route[2] : '');
    }

    /**
     * @param Mana_Seo_Resource_Url_Collection $collection
     * @param string[] $columns
     * @return array | bool
     */
    public function getUrlKey($collection, $columns = array()) {
        $select = $collection->getSelect()
            ->reset(Varien_Db_Select::COLUMNS)
            ->columns(array_merge(array('id', 'final_url_key'), $columns));
        $urls = $collection->getConnection()->fetchAll($select);
        if ($urls && ($count = count($urls)) > 0) {
            if ($count > 1) {
                $ids = array();
                foreach ($urls as $url) {
                    $ids[] = $url['id'];
                }
                /* @var $logger Mana_Core_Helper_Logger */
                $logger = Mage::helper('mana_core/logger');
                $logger->logSeoUrl(sprintf('NOTICE: Multiple URL keys found for one match request, taking first one. All URL key ids: %s', implode($ids)));
            }
            return $urls[0];
        }
        else {
            return false;
        }
    }

    public function getSeoRouteParam($key) {
        if (isset($this->_routeParams[$key])) {
            $result = $this->_routeParams[$key];
            return $result;
        }
        elseif (isset($this->_routeParams['_current'])) {
            return $this->getRequest()->getUserParam($key, false);
        }
        return false;
    }

    public function getSchema() {
        return $this->_schema;
    }

    /**
     * @param $optionId
     * @return array | bool
     */
    protected function _getValueUrlKey($optionId) {
        /* @var $seo Mana_Seo_Helper_Data */
        $seo = Mage::helper('mana_seo');

        /* @var $logger Mana_Core_Helper_Logger */
        $logger = Mage::helper('mana_core/logger');

        $urlCollection = $seo->getUrlCollection($this->getSchema(), Mana_Seo_Resource_Url_Collection::TYPE_ATTRIBUTE_VALUE);
        $urlCollection->addFieldToFilter('option_id', $optionId);
        if (!($result = $this->getUrlKey($urlCollection, array('final_include_filter_name', 'position', 'option_id')))) {
            $logger->logSeoUrl(sprintf('WARNING: %s not found by  %s %s', 'attribute option URL key', 'id', $optionId));
        }

        return $result;
    }

    protected function _getCategoryUrlKey($categoryId) {
        /* @var $seo Mana_Seo_Helper_Data */
        $seo = Mage::helper('mana_seo');

        /* @var $logger Mana_Core_Helper_Logger */
        $logger = Mage::helper('mana_core/logger');

        $urlCollection = $seo->getUrlCollection($this->getSchema(), Mana_Seo_Resource_Url_Collection::TYPE_CATEGORY_VALUE);
        $urlCollection->addFieldToFilter('category_id', $categoryId);
        if (!($result = $this->getUrlKey($urlCollection, array('category_id')))) {
            $logger->logSeoUrl(sprintf('WARNING: %s not found by  %s %s', 'category URL key', 'id', $categoryId));
        }

        return $result;
    }

    /**
     * @param string $key
     * @return Mana_Seo_Model_Url bool
     */
    protected function _getParameterUrl($key) {
        /* @var $seo Mana_Seo_Helper_Data */
        $seo = Mage::helper('mana_seo');

        $parameterUrls = $seo->getParameterUrls($this->_schema);
        return isset($parameterUrls[$key]) ? $parameterUrls[$key] : false;
    }

    /**
     * @param Mana_Seo_Model_Url $parameterUrl
     * @param string $value
     * @return string
     */
    protected function _generateAttributeParameter($parameterUrl, $value) {
        $path = '';
        $includeFilterName = false;
        $urlKeys = array();
        foreach (explode('_', $value) as $singleValue) {
            if ($urlKey = $this->_getValueUrlKey($singleValue)) {
                if ($urlKey['final_include_filter_name']) {
                    $includeFilterName = true;
                }
                $urlKeys[] = $urlKey;
            }
        }
        uasort($urlKeys, array($this, '_compareAttributeUrlKeys'));
        foreach ($urlKeys as $urlKey) {
            if ($path) {
                $path .= $this->_schema->getMultipleValueSeparator();
            }
            $path .= $urlKey['final_url_key'];
        }
        if ($includeFilterName) {
            $path = $parameterUrl->getFinalUrlKey() . $this->_schema->getFirstValueSeparator() . $path;
        }
        return $path;
    }

    /**
     * @param Mana_Seo_Model_Url $parameterUrl
     * @param string $value
     * @return array
     */
    protected function _generateCategoryParameter($parameterUrl, $value) {
        if ($urlKey = $this->_getCategoryUrlKey($value)) {
            return array($parameterUrl->getFinalUrlKey() . $this->_schema->getFirstValueSeparator().
                $urlKey['final_url_key'], $urlKey['category_id']);
        }

        return array(null, null);
    }

    /**
     * @param Mana_Seo_Model_Url $parameterUrl
     * @param string $value
     * @return string
     */
    protected function _generatePriceParameter($parameterUrl, $value) {
        /* @var $core Mana_Core_Helper_Data */
        $core = Mage::helper('mana_core');

        $isSlider = $core->isManadevLayeredNavigationInstalled() &&
            in_array($parameterUrl->getFilterDisplay(), array('slider', 'range'));

        $path = '';
        if ($value != '__0__,__1__') {
            $values = array();
            foreach (explode('_', $value) as $singleValue) {
                $values[] = explode(',', $singleValue);
            }
            uasort($values, array($this, '_comparePriceValues'));
        }
        else {
            $values = array(explode(',', $value));
        }
        foreach ($values as $singleValue) {
            list($from, $to) = $singleValue;
            if ($path) {
                $path .= $this->_schema->getMultipleValueSeparator();
            }
            if ($isSlider) {
                $path .= $from . $this->_schema->getPriceSeparator() . $to;
            }
            else {
                $index = $from;
                $range = $to;
                if ($this->_schema->getUseRangeBounds()) {
                    $from = ($index - 1) * $range;
                    $to = $from + $range;
                    $path .= $from . $this->_schema->getPriceSeparator() . $to;
                }
                else {
                    $path .= $index . $this->_schema->getPriceSeparator() . $range;
                }
            }
        }
        $path = $parameterUrl->getFinalUrlKey() . $this->_schema->getFirstValueSeparator() . $path;

        return $path;
    }

    /**
     * @param Mana_Seo_Model_Url $parameterUrl
     * @param string $value
     * @return string
     */
    protected function _generateToolbarParameter($parameterUrl, $value) {
            $path = $parameterUrl->getFinalUrlKey() . $this->_schema->getFirstValueSeparator() . $value;

        return $path;
    }

    protected function _compareSeoParams($a, $b) {
        if ($a['position'] < $b['position']) return -1;
        if ($a['position'] > $b['position']) return 1;

        if ($a['attribute_id'] !== null) {
            if ($b['attribute_id'] !== null) {
                if ($a['attribute_id'] < $b['attribute_id']) return -1;
                if ($a['attribute_id'] > $b['attribute_id']) return 1;
            }
            else {
                return -1;
            }
        }
        else {
            if ($b['attribute_id'] !== null) {
                return 1;
            }
        }

        return 0;
    }

    protected function _compareAttributeUrlKeys($a, $b) {
        if ($a['position'] < $b['position']) return -1;
        if ($a['position'] > $b['position']) return 1;

        if ($a['option_id'] !== null) {
            if ($b['option_id'] !== null) {
                if ($a['option_id'] < $b['option_id']) return -1;
                if ($a['option_id'] > $b['option_id']) return 1;
            }
            else {
                return -1;
            }
        }
        else {
            if ($b['option_id'] !== null) {
                return 1;
            }
        }

        return 0;
    }

    protected function _comparePriceValues($a, $b) {
        if ($a[0] < $b[0]) return -1;
        if ($a[0] > $b[0]) return 1;

        return 0;
    }

    protected function _redirectToSubcategory(&$seoParams) {
        if ($this->_schema->getRedirectToSubcategory() && isset($seoParams['cat'])) {
            if (in_array($this->_routePath, array('catalog/category/view', 'cms/index/index'))) {
                $this->_routePath = 'catalog/category/view';
                $this->_routeParams['id'] = $seoParams['cat']['category_id'];
                $this->_pageType = $this->_getPageType($this->_routePath);
                $this->_suffix = $this->_pageType->getCurrentSuffix();
                $this->_pageUrlKey = $this->_pageType->getUrlKey($this);
                unset($seoParams['cat']);
            }
        }

        return $this;
    }
}