<?php
/** 
 * @category    Mana
 * @package     Mana_Seo
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */
/**
 * @author Mana Team
 * @method Zend_Controller_Request_Http getRequest()
 * @method Mana_Seo_Model_Context setRequest(Zend_Controller_Request_Http $value)
 * @method string getPath()
 * @method Mana_Seo_Model_Context setPath(string $value)
 * @method string getOriginalSlash()
 * @method Mana_Seo_Model_Context setOriginalSlash(string $value)
 * @method string getAlternativeSlash()
 * @method Mana_Seo_Model_Context setAlternativeSlash(string $value)
 * @method string getAction()
 * @method Mana_Seo_Model_Context setAction(string $value)
 * @method string getMode()
 * @method Mana_Seo_Model_Context setMode(string $value)
 * @method string getQuery()
 * @method Mana_Seo_Model_Context setQuery(string $value)
 * @method int getStoreId()
 * @method Mana_Seo_Model_Context setStoreId(int $value)
 * @method Mana_Seo_Model_Schema getSchema()
 * @method Mana_Seo_Model_Context setSchema(Mana_Seo_Model_Schema $value)
 * @method string[] getCandidates()
 * @method Mana_Seo_Model_Context setCandidates(array $value)
 * @method Mana_Seo_Model_Page getPage()
 * @method Mana_Seo_Model_Context setPage(Mana_Seo_Model_Page $value)
 */
class Mana_Seo_Model_Context extends Varien_Object {
    const ACTION_FORWARD = 'forward';
    const ACTION_REDIRECT = 'redirect';
    const MODE_OPTIMIZED = 'optimized';
    const MODE_DIAGNOSTIC = 'diagnostic';

    public function pushData($key, $value) {
        $stackKey = $key.'_stack';
        if ($this->hasData($key)) {
            $stack = $this->hasData($stackKey) ? $this->getData($stackKey) : array();
            array_push($stack, $this->getData($key));
            $this->setData($stackKey, $stack);
        }
        return $this->setData($key, $value);
    }

    public function popData($key) {
        $stackKey = $key . '_stack';
        $result = $this->getData($key);
        if ($this->hasData($stackKey)) {
            $stack = $this->getData($stackKey);
            $previousValue = array_pop($stack);
            if (count($stack)) {
                $this->setData($stackKey, $stack);
            }
            else {
                $this->unsetData($stackKey);
            }
            $this->setData($key, $previousValue);
        }
        else {
            $this->unsetData($key);
        }
        return $result;
    }

}