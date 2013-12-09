<?php
/** 
 * @category    Mana
 * @package     Mana_AttributePage
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */
/**
 * @author Mana Team
 *
 */
class Mana_AttributePage_Block_Adminhtml_AttributePage_OptionGeneralForm  extends Mana_AttributePage_Block_Adminhtml_AttributePage_AbstractForm
{
    protected function _prepareLayout() {
        parent::_prepareLayout();
        if (Mage::getSingleton('cms/wysiwyg_config')->isEnabled()) {
            $this->getLayout()->getBlock('head')->setData('can_load_tiny_mce', true);
        }
    }

    /**
     * @return Mage_Adminhtml_Block_Widget_Form
     */
    protected function _prepareForm() {
        $form = new Varien_Data_Form(array(
            'id' => 'mf_option_general',
            'html_id_prefix' => 'mf_option_general_',
            'field_container_id_prefix' => 'mf_option_general_tr_',
            'use_container' => true,
            'method' => 'post',
            'action' => $this->getUrl('*/*/save', array('_current' => true)),
            'field_name_suffix' => 'fields',
            'flat_model' => $this->getFlatModel(),
            'edit_model' => $this->getEditModel(),
        ));

        $fieldset = $this->addFieldset($form, 'mfs_option_other', array(
            'title' => $this->__('Other Settings'),
            'legend' => $this->__('Other Settings'),
        ));

        $this->addField($fieldset, 'option_page_is_active', 'select', array(
            'label' => $this->__('Status'),
            'title' => $this->__('Status'),
            'options' => $this->getStatusSourceModel()->getOptionArray(),
            'name' => 'option_page_is_active',
            'required' => true,
        ));

        $this->addField($fieldset, 'option_page_include_in_menu', 'select', array(
            'label' => $this->__('Include In Menu'),
            'title' => $this->__('Include In Menu'),
            'options' => $this->getYesNoSourceModel()->getOptionArray(),
            'name' => 'option_page_include_in_menu',
            'required' => true,
        ));


        $this->setForm($form);
        return parent::_prepareForm();
    }
}