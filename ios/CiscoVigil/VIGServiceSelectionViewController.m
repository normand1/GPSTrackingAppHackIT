//
//  VIGServiceSelectionViewController.m
//  CiscoVigil
//
//  Created by davinorm on 2/21/14.
//  Copyright (c) 2014 David Norman. All rights reserved.
//

#import "VIGServiceSelectionViewController.h"

@interface VIGServiceSelectionViewController ()

@end

@implementation VIGServiceSelectionViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
    
    
    self.picker = [[UIPickerView alloc]init];
    self.picker.delegate = self;
    
    _serviceArray = @[@"Basic Plan", @"Standard Plan",
                      @"Premium Plan"];
}


#pragma mark -
#pragma mark PickerView DataSource

- (NSInteger)numberOfComponentsInPickerView:
(UIPickerView *)pickerView
{
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView
numberOfRowsInComponent:(NSInteger)component
{
    return _serviceArray.count;
}

- (NSString *)pickerView:(UIPickerView *)pickerView
             titleForRow:(NSInteger)row
            forComponent:(NSInteger)component
{
    return _serviceArray[row];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
